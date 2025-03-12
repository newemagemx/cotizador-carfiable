
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ZEPTO_API_KEY = Deno.env.get("ZEPTO_API_KEY") || "wSsVR612rx70CPh/njSpc71sz1pXUQ73HUUuiQOkuH+tGajKocdtkkKfBAOuH6JJRDZqQmMUpbMozRdW2jUG3owtzA4ECCiF9mqRe1U4J3x17qnvhDzPXGxblhuLJIwLxw5pk2NkEMkq+g==";
const ZEPTO_EMAIL = "noreply@carfiable.mx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  toName: string;
  subject: string;
  htmlContent: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, toName, subject, htmlContent } = await req.json() as EmailRequest;

    if (!to || !subject || !htmlContent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Sending email to: ${to}`);

    const response = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Zoho-enczapikey ${ZEPTO_API_KEY}`
      },
      body: JSON.stringify({
        "from": { "address": ZEPTO_EMAIL },
        "to": [{ "email_address": { "address": to, "name": toName } }],
        "subject": subject,
        "htmlbody": htmlContent
      })
    });

    const data = await response.json();
    console.log("Zepto API response:", data);

    if (!response.ok) {
      throw new Error(`Zepto API error: ${JSON.stringify(data)}`);
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
