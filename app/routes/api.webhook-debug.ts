// app/routes/api.webhook-debug.ts
import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  try {
    // Log all headers
    const headers = Object.fromEntries(request.headers.entries());
    console.log("Received webhook with headers:", JSON.stringify(headers, null, 2));
    
    // Get the raw body
    const rawBody = await request.text();
    console.log("Raw webhook body (first 200 chars):", rawBody.substring(0, 200));
    
    // Try to parse as JSON
    let payload;
    try {
      payload = JSON.parse(rawBody);
      console.log("Parsed JSON payload:", JSON.stringify(payload, null, 2));
    } catch (e) {
      console.log("Body is not valid JSON:", e);
    }
    
    // Always return success so WooCommerce doesn't retry
    return json({ 
      status: "success", 
      message: "Debug endpoint received webhook",
      received: {
        headers,
        bodyPreview: rawBody.substring(0, 100) + "...",
      }
    });
  } catch (error) {
    console.error("Debug webhook handler error:", error);
    // Still return 200 to prevent retries
    return json({ 
      status: "error", 
      message: "Error in debug handler",
      error: String(error)
    });
  }
};