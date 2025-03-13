
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
    console.log(`Sending verification code to phone: ${phone}`)
    
    if (!phone) {
      throw new Error('Phone number is required')
    }
    
    if (!verificationCode) {
      throw new Error('Verification code is required')
    }
    
    // Get Twilio credentials from environment variables
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const fromPhone = Deno.env.get('TWILIO_PHONE_NUMBER') || '+19783181260'
    
    if (!accountSid || !authToken) {
      console.error('Twilio credentials missing:', { accountSid: !!accountSid, authToken: !!authToken })
      throw new Error('Twilio credentials not configured')
    }
    
    // Ensure phone number starts with +
    // The phone number should already be formatted correctly by the frontend
    // with the appropriate country code (+52 or +1)
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`
    console.log(`Normalized phone: ${normalizedPhone}`)
    
    // Updated SMS message with customized text
    const customMessage = `Tu código de verificación del Cotizador Carfiable es: ${verificationCode}`
    
    // Send SMS via Twilio API
    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    console.log(`Using Twilio endpoint: ${twilioEndpoint}`)
    
    const twilioBody = new URLSearchParams({
      From: fromPhone,
      To: normalizedPhone,
      Body: customMessage,
    }).toString()
    
    console.log('Sending request to Twilio...')
    const twilioResponse = await fetch(twilioEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: twilioBody,
    })
    
    console.log(`Twilio response status: ${twilioResponse.status}`)
    const twilioData = await twilioResponse.json()
    console.log('Twilio response data:', JSON.stringify(twilioData))
    
    if (!twilioResponse.ok) {
      console.error('Twilio error details:', twilioData)
      throw new Error(`Failed to send SMS: ${twilioData.message || twilioData.error_message || 'Unknown error'}`)
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
