// app/routes/api.debug-webhook.ts
import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  try {
    console.log("Debug webhook called at:", new Date().toISOString());
    
    // Log all headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
      console.log(`Header ${key}: ${value}`);
    });
    
    // Get the raw body
    const rawBody = await request.text();
    console.log("Raw body:", rawBody);
    
    // Try to parse the body
    let bodyContent;
    try {
      // First try JSON parsing
      bodyContent = JSON.parse(rawBody);
      console.log("Parsed JSON body:", JSON.stringify(bodyContent, null, 2));
    } catch {
      // If not JSON, try URL-encoded parsing
      try {
        bodyContent = Object.fromEntries(new URLSearchParams(rawBody));
        console.log("Parsed URL-encoded body:", JSON.stringify(bodyContent, null, 2));
      } catch {
        // If all parsing fails, use raw text
        bodyContent = { rawText: rawBody };
        console.log("Unparseable body received");
      }
    }
    
    // Compute signatures for debugging
    console.log("Available signature verification methods:");
    console.log("- WooCommerce Signature Header:", request.headers.get("x-wc-webhook-signature"));
    console.log("- Vercel Proxy Signature:", request.headers.get("x-vercel-proxy-signature"));
    
    // Debug environment variables
    console.log("Environment Variables:");
    console.log("WEBHOOK_SECRET:", process.env.WEBHOOK_SECRET ? "[PRESENT]" : "[MISSING]");
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      headers: headers,
      body: bodyContent,
      method: request.method,
      url: request.url
    };
    
    console.log("Full debug info:", JSON.stringify(debugInfo, null, 2));
    
    // Return debug information
    return json(debugInfo, { status: 200 });
  } catch (error) {
    console.error("Debug webhook error:", error);
    return json({ 
      status: "error", 
      message: "Error in debug webhook handler",
      error: String(error)
    }, { status: 500 });
  }
};