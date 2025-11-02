import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationResult {
  posterUrl: string;
  aiFindings: string;
  discrepancies: string[];
  status: 'match' | 'mismatch' | 'error';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { resultId } = await req.json();
    
    if (!resultId) {
      return new Response(
        JSON.stringify({ error: 'Result ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Verifying posters for result: ${resultId}`);

    // Fetch result data with program name
    const { data: result, error: resultError } = await supabase
      .from('results')
      .select(`
        *,
        programs (name)
      `)
      .eq('id', resultId)
      .single();

    if (resultError || !result) {
      console.error('Error fetching result:', resultError);
      return new Response(
        JSON.stringify({ error: 'Result not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (!result.poster_urls || result.poster_urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No posters found for this result' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Found ${result.poster_urls.length} poster(s) to verify`);

    // Prepare expected result data for AI
    const expectedData = {
      programName: result.programs?.name || 'Unknown',
      first: `${result.first_place_name} (${result.first_place_grade}) - ${result.first_place_points} points`,
      second: `${result.second_place_name} (${result.second_place_grade}) - ${result.second_place_points} points`,
      third: `${result.third_place_name} (${result.third_place_grade}) - ${result.third_place_points} points`,
      additional: result.additional_grades || []
    };

    const verificationResults: VerificationResult[] = [];

    // Verify each poster
    for (const posterUrl of result.poster_urls) {
      try {
        console.log(`Analyzing poster: ${posterUrl}`);

        const prompt = `You are verifying competition results. Analyze this result poster image and extract the following information:
- Program/Competition name
- First place winner (name, grade/class, points)
- Second place winner (name, grade/class, points)
- Third place winner (name, grade/class, points)
- Any additional placements mentioned

Expected results from database:
- Program: ${expectedData.programName}
- First Place: ${expectedData.first}
- Second Place: ${expectedData.second}
- Third Place: ${expectedData.third}
${expectedData.additional.length > 0 ? `- Additional: ${JSON.stringify(expectedData.additional)}` : ''}

Compare what you see in the image with the expected results. Report any discrepancies in:
1. Names (spelling differences, completely different names)
2. Grades/Classes
3. Points awarded
4. Program name

Be specific about discrepancies. If everything matches, say "All information matches database records."`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: posterUrl } }
                ]
              }
            ],
            max_tokens: 1000,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI API error for ${posterUrl}:`, errorText);
          verificationResults.push({
            posterUrl,
            aiFindings: 'Error analyzing poster',
            discrepancies: [`AI analysis failed: ${errorText}`],
            status: 'error'
          });
          continue;
        }

        const aiData = await aiResponse.json();
        const aiFindings = aiData.choices[0]?.message?.content || 'No response from AI';
        
        console.log(`AI findings for ${posterUrl}:`, aiFindings);

        // Determine if there are discrepancies
        const hasDiscrepancies = !aiFindings.toLowerCase().includes('all information matches') &&
                                !aiFindings.toLowerCase().includes('everything matches');

        const discrepancies: string[] = [];
        if (hasDiscrepancies) {
          // Extract discrepancy details from AI response
          const lines = aiFindings.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            if (line.toLowerCase().includes('discrepancy') || 
                line.toLowerCase().includes('difference') ||
                line.toLowerCase().includes('mismatch') ||
                line.includes('≠') ||
                line.includes('!=') ||
                line.includes('vs') ||
                line.includes('expected') ||
                line.includes('actual')) {
              discrepancies.push(line.trim());
            }
          });

          if (discrepancies.length === 0) {
            discrepancies.push(aiFindings);
          }
        }

        verificationResults.push({
          posterUrl,
          aiFindings,
          discrepancies: discrepancies.length > 0 ? discrepancies : ['All information matches database records'],
          status: hasDiscrepancies ? 'mismatch' : 'match'
        });

      } catch (error) {
        console.error(`Error verifying poster ${posterUrl}:`, error);
        verificationResults.push({
          posterUrl,
          aiFindings: 'Error during verification',
          discrepancies: [`Verification error: ${error.message}`],
          status: 'error'
        });
      }
    }

    const hasMismatches = verificationResults.some(r => r.status === 'mismatch');
    const hasErrors = verificationResults.some(r => r.status === 'error');

    console.log(`Verification complete. Mismatches: ${hasMismatches}, Errors: ${hasErrors}`);

    return new Response(
      JSON.stringify({
        success: true,
        resultId,
        programName: result.programs?.name,
        verificationResults,
        summary: {
          total: verificationResults.length,
          matches: verificationResults.filter(r => r.status === 'match').length,
          mismatches: verificationResults.filter(r => r.status === 'mismatch').length,
          errors: verificationResults.filter(r => r.status === 'error').length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
