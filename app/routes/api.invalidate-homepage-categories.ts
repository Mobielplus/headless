// app/routes/api.invalidate-homepage-categories.ts
import { ActionFunction, json } from "@remix-run/node";
import { invalidateHomepageCategories } from "~/lib/graphql";
import * as crypto from 'crypto';

export const action: ActionFunction = async ({ request }) => {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    
    // Get the signature from headers
    const signature = request.headers.get("x-wc-webhook-signature");
    const SECRET_KEY = process.env.HOMEPAGE_WEBHOOK_SECRET;
    
    if (!signature || !SECRET_KEY) {
      console.error("Missing signature or secret key");
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Compute expected signature (HMAC with SHA-256)
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(rawBody)
      .digest('base64');
    
    // Log signatures for debugging (remove in production)
    console.log("Received signature:", signature);
    console.log("Calculated signature:", expectedSignature);
    
    // Compare signatures
    if (signature !== expectedSignature) {
      console.error("Invalid signature");
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // If we reach here, the signature is valid
    console.log("Webhook authenticated successfully");
    
    // Parse the request body as JSON (need to re-parse since we already consumed it)
    const payload = JSON.parse(rawBody);
    
    // Log webhook details
    console.log("Webhook event:", request.headers.get("x-wc-webhook-event"));
    console.log("Webhook resource:", request.headers.get("x-wc-webhook-resource"));
    console.log("Webhook topic:", request.headers.get("x-wc-webhook-topic"));
    
    // Invalidate the cache
    await invalidateHomepageCategories();
    console.log("Invalidated homepage categories cache");
    
    return json({ success: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Always return 200 so WooCommerce doesn't retry
    return json({ 
      status: "error", 
      message: "Error in webhook handler",
      error: String(error)
    }, { status: 200 });
  }
};