
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabaseClient.storage.listBuckets()
    
    if (listError) {
      throw listError
    }
    
    // Create the bucket if it doesn't exist
    if (!buckets.find(b => b.name === 'profile_pictures')) {
      const { data, error } = await supabaseClient.storage.createBucket('profile_pictures', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      })
      
      if (error) {
        throw error
      }
      
      // Set up bucket policies (make it public)
      const { error: policyError } = await supabaseClient.storage.from('profile_pictures').createPolicy(
        'Public Access',
        {
          name: 'Public Access',
          definition: {
            type: 'download',
            format: 'file',
            path: '*',
            public: true
          }
        }
      )
      
      if (policyError) {
        throw policyError
      }
      
      console.log('Created profile_pictures bucket with public access')
      return new Response(
        JSON.stringify({ message: 'Created profile_pictures bucket with public access' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ message: 'profile_pictures bucket already exists' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
