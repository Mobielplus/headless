// app/routes/api/webhook-debug.ts
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import * as crypto from 'crypto';

// Function to verify WooCommerce webhook signature
function verifyWebhookSignature(
  rawBody: string, 
  signature: string | null, 
  secret: string
): boolean {
  if (!signature) {
    console.log("No signature provided in request headers");
    return false;
  }
  
  try {
    // Create HMAC-SHA256 hash using the secret
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest('base64');
    
    // Log signatures for debugging (remove in production)
    console.log("Received signature:", signature);
    console.log("Calculated signature:", calculatedSignature);
    
    // Compare calculated signature with received signature
    return calculatedSignature === signature;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// Handle POST requests (for webhooks)
export const action: ActionFunction = async ({ request }) => {
  try {
    // Log all headers
    const headers = Object.fromEntries(request.headers.entries());
    console.log("Received webhook with headers:", JSON.stringify(headers, null, 2));
    
    // Get the raw body
    const rawBody = await request.text();
    console.log("Raw webhook body (first 200 chars):", rawBody.substring(0, 200));
    
    // Get webhook signature and verify it
    const secret = "your-secret-homepage"; // Your WooCommerce webhook secret
    const signature = request.headers.get('x-wc-webhook-signature');
    const isSignatureValid = verifyWebhookSignature(rawBody, signature, secret);
    console.log("Webhook signature valid:", isSignatureValid);
    
    // Try to parse based on content type
    let payload;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        payload = JSON.parse(rawBody);
        console.log("Parsed JSON payload:", JSON.stringify(payload, null, 2));
      } catch (e) {
        console.log("Body is not valid JSON:", e);
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      try {
        // Parse form data
        const formData = new URLSearchParams(rawBody);
        payload = Object.fromEntries(formData.entries());
        console.log("Parsed form data:", JSON.stringify(payload, null, 2));
      } catch (e) {
        console.log("Failed to parse form data:", e);
      }
    } else {
      console.log("Unhandled content type:", contentType);
    }
    
    // Always return success so WooCommerce doesn't retry
    return json({ 
      status: "success", 
      message: "Debug endpoint received webhook",
      received: {
        headers,
        bodyPreview: rawBody.substring(0, 100) + "...",
        payload,
        signatureValid: isSignatureValid
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

// Add this to handle GET requests (for browser testing)
export const loader: LoaderFunction = async ({ request }) => {
  return json({
    message: "Webhook debug endpoint is working",
    instructions: "This endpoint is for POST requests from WooCommerce webhooks",
    requestInfo: {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    }
  });
};