
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'signin' | 'signup' | 'activity' | 'setup';
  user: {
    email: string;
    id: string;
  };
  details?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Email notification function called");
    
    const { type, user, details }: NotificationRequest = await req.json();

    let subject = '';
    let content = '';

    switch (type) {
      case 'signin':
        subject = 'New Sign In Detected';
        content = `User ${user.email} (ID: ${user.id}) has signed in.`;
        break;
      case 'signup':
        subject = 'New User Registration';
        content = `A new user has registered: ${user.email} (ID: ${user.id})`;
        break;
      case 'setup':
        subject = 'User Profile Setup';
        content = `User ${user.email} (ID: ${user.id}) has completed their profile setup.`;
        break;
      case 'activity':
        subject = 'User Activity Notification';
        content = `User ${user.email} (ID: ${user.id}): ${details}`;
        break;
    }

    console.log(`Sending email notification: ${subject} - ${content}`);
    console.log(`To: sujalgiri574@gmail.com, From: Memoria Notifications <onboarding@resend.dev>`);

    const emailResponse = await resend.emails.send({
      from: "Memoria Notifications <onboarding@resend.dev>",
      to: ["sujalgiri574@gmail.com"],
      subject,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>${subject}</h2>
          <p>${content}</p>
          <p>Time: ${new Date().toLocaleString()}</p>
          <hr/>
          <p>This is an automated notification from your Memoria application.</p>
        </div>
      `,
    });

    console.log("Email sending response:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
