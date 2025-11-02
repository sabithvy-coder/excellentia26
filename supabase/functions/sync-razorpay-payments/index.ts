import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const razorpayKeyId = 'rzp_live_RalCj3UqJFYX6k';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret key not configured');
    }

    // Fetch payments from Razorpay
    const authHeader = `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`;
    
    const response = await fetch('https://api.razorpay.com/v1/payments?count=100', {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`Razorpay API error: ${response.statusText}`);
    }

    const razorpayData = await response.json();
    const payments = razorpayData.items || [];

    // Sync payments to database
    let syncedCount = 0;
    let updatedCount = 0;

    for (const payment of payments) {
      if (payment.status === 'captured' || payment.status === 'authorized') {
        // Check if payment already exists
        const { data: existing } = await supabaseClient
          .from('donations')
          .select('id, status')
          .eq('payment_id', payment.id)
          .maybeSingle();

        const donationData = {
          payment_id: payment.id,
          order_id: payment.order_id || null,
          amount: payment.amount, // Razorpay amount is already in paise
          donor_name: payment.notes?.donor_name || payment.email || 'Anonymous',
          status: 'completed',
          created_at: new Date(payment.created_at * 1000).toISOString(),
        };

        if (existing) {
          // Update existing record if status changed
          if (existing.status !== 'completed') {
            await supabaseClient
              .from('donations')
              .update({ status: 'completed' })
              .eq('id', existing.id);
            updatedCount++;
          }
        } else {
          // Insert new record
          await supabaseClient
            .from('donations')
            .insert(donationData);
          syncedCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${syncedCount} new donations, updated ${updatedCount} existing donations`,
        total: payments.length,
        synced: syncedCount,
        updated: updatedCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error syncing payments:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});