
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phone, verificationCode } = await req.json()
    
    if (!phone) {
      throw new Error('Phone number is required')
    }
    
    if (!verificationCode) {
      throw new Error('Verification code is required')
    }
    
    // Get Twilio credentials from environment variables
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured')
    }
    
    // Normalize phone number (make sure it starts with +)
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`
    
    // Send SMS via Twilio API
    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    
    const twilioResponse = await fetch(twilioEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: '+19783181260', // Your Twilio phone number (using a demo one)
        To: normalizedPhone,
        Body: `Tu código de verificación Auto Quote Ninja es: ${verificationCode}`,
      }).toString(),
    })
    
    const twilioData = await twilioResponse.json()
    
    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioData)
      throw new Error(`Failed to send SMS: ${twilioData.message || 'Unknown error'}`)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification code sent successfully',
        sid: twilioData.sid,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending SMS:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
