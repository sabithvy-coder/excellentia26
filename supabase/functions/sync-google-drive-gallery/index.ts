import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  webContentLink?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { folderUrl } = await req.json()
    
    if (!folderUrl) {
      return new Response(
        JSON.stringify({ error: 'Folder URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('GOOGLE_DRIVE_API_KEY')
    if (!apiKey) {
      console.error('Google Drive API key not configured')
      return new Response(
        JSON.stringify({ error: 'Google Drive API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract folder ID from URL
    const folderId = extractFolderId(folderUrl)
    if (!folderId) {
      return new Response(
        JSON.stringify({ error: 'Invalid Google Drive folder URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching files from folder:', folderId)

    // List all image files in the folder
    const listUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+(mimeType+contains+'image/')&fields=files(id,name,mimeType,webContentLink)&key=${apiKey}`
    
    const listResponse = await fetch(listUrl)
    if (!listResponse.ok) {
      const errorText = await listResponse.text()
      console.error('Google Drive API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch files from Google Drive' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const listData = await listResponse.json()
    const files: GoogleDriveFile[] = listData.files || []

    if (files.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No image files found in the folder', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${files.length} image files`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const results = []
    let successCount = 0
    let errorCount = 0

    // Process each file
    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}`)

        // Download file from Google Drive
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${apiKey}`
        const downloadResponse = await fetch(downloadUrl)
        
        if (!downloadResponse.ok) {
          console.error(`Failed to download ${file.name}`)
          errorCount++
          results.push({ name: file.name, status: 'error', error: 'Download failed' })
          continue
        }

        let fileBlob = await downloadResponse.blob()
        let fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        let contentType = file.mimeType
        
        // Skip HEIC files and log a warning
        if (fileExt === 'heic' || fileExt === 'heif') {
          console.log(`Skipping HEIC file (not supported for server-side conversion): ${file.name}`)
          errorCount++
          results.push({ 
            name: file.name, 
            status: 'error', 
            error: 'HEIC format not supported. Please convert to JPEG before uploading to Google Drive.' 
          })
          continue
        }
        
        const fileName = `gallery-gdrive-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, fileBlob, {
            contentType: contentType,
            upsert: false
          })

        if (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError)
          errorCount++
          results.push({ name: file.name, status: 'error', error: uploadError.message })
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(fileName)

        // Add to gallery table
        const { error: insertError } = await supabase
          .from('gallery')
          .insert({
            image_url: publicUrl,
            caption: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for caption
            link_url: null
          })

        if (insertError) {
          console.error(`Failed to insert ${file.name} to gallery:`, insertError)
          errorCount++
          results.push({ name: file.name, status: 'error', error: insertError.message })
          continue
        }

        successCount++
        results.push({ name: file.name, status: 'success' })
        console.log(`Successfully processed: ${file.name}`)
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
        errorCount++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push({ name: file.name, status: 'error', error: errorMessage })
      }
    }

    return new Response(
      JSON.stringify({
        message: `Sync completed: ${successCount} successful, ${errorCount} failed`,
        total: files.length,
        successCount,
        errorCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sync-google-drive-gallery function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function extractFolderId(url: string): string | null {
  // Handle different Google Drive URL formats
  // https://drive.google.com/drive/folders/FOLDER_ID
  // https://drive.google.com/drive/u/0/folders/FOLDER_ID
  
  const patterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  // If it's just an ID
  if (/^[a-zA-Z0-9_-]+$/.test(url)) {
    return url
  }
  
  return null
}
