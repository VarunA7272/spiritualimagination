// Production-ready OTP sender. Not wired into the frontend yet — this is
// here so it's ready to drop in the moment you have Twilio/MSG91 credentials.
//
// To go live: change AuthOtpService.requestOtp() to call
//   this.supabaseService's supabase.functions.invoke('request-otp', { body: { mobile_num } })
// instead of the request_otp RPC, and remove the dev-mode `request_otp`
// SQL function (or stop returning otp_code from it) so codes are never
// sent back to the client.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { mobile_num } = await req.json();
    if (!mobile_num) {
      return new Response(JSON.stringify({ success: false, message: "Mobile number required" }),
        { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { count } = await supabase
      .from("otp_verifications")
      .select("*", { count: "exact", head: true })
      .eq("mobile_num", mobile_num)
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

    if ((count ?? 0) >= 3) {
      return new Response(JSON.stringify({ success: false, message: "Too many attempts. Try again later." }),
        { status: 429, headers: corsHeaders });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: insertError } = await supabase.from("otp_verifications").insert({
      mobile_num,
      otp_code: otp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
    if (insertError) throw insertError;

    // --- SMS provider call (Twilio example — swap for MSG91 if preferred) ---
    const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const TWILIO_AUTH = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const TWILIO_FROM = Deno.env.get("TWILIO_FROM_NUMBER")!;

    const smsRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_AUTH}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `+91${mobile_num}`,
          From: TWILIO_FROM,
          Body: `Your Spiritual Imagination verification code is ${otp}. Valid for 5 minutes.`,
        }),
      }
    );

    if (!smsRes.ok) {
      const errText = await smsRes.text();
      console.error("SMS send failed:", errText);
      return new Response(JSON.stringify({ success: false, message: "Failed to send OTP SMS" }),
        { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, message: "OTP sent" }),
      { headers: corsHeaders });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, message: "Server error" }),
      { status: 500, headers: corsHeaders });
  }
});
