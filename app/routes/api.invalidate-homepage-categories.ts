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
    // Use the shared webhook secret
    const SECRET_KEY = process.env.WEBHOOK_SECRET;
    
    if (!signature || !SECRET_KEY) {
      console.error("Missing signature or secret key");
      console.error("WEBHOOK_SECRET environment variable present:", !!process.env.WEBHOOK_SECRET);
      console.error("Received headers:", JSON.stringify(Object.fromEntries([...request.headers.entries()]), null, 2));
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Log the raw body for debugging
    console.log("Raw body for signature (first 100 chars):", rawBody.substring(0, 100));
    console.log("Raw body length:", rawBody.length);
    
    // Compute expected signature (HMAC with SHA-256)
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(rawBody)
      .digest('base64');
    
    // Try alternative encoding methods in case WooCommerce is using a different encoding
    const expectedSignatureUtf8 = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(Buffer.from(rawBody, 'utf8'))
      .digest('base64');
      
    // Log signatures for debugging
    console.log("Received signature:", signature);
    console.log("Expected signature (default):", expectedSignature);
    console.log("Expected signature (utf8 buffer):", expectedSignatureUtf8);
    
    // Compare signatures (use a timing-safe comparison if possible)
    if (signature !== expectedSignature && signature !== expectedSignatureUtf8) {
      console.error("Invalid signature. Authentication failed.");
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Log webhook details
    console.log("Webhook event:", request.headers.get("x-wc-webhook-event"));
    console.log("Webhook resource:", request.headers.get("x-wc-webhook-resource"));
    console.log("Webhook topic:", request.headers.get("x-wc-webhook-topic"));
    
    try {
      // Parse the request body as JSON
      const payload = JSON.parse(rawBody);
      console.log("Processing webhook payload for:", payload.name || "unknown category");
      
      // Invalidate the cache
      await invalidateHomepageCategories();
      console.log("Invalidated homepage categories cache");
      
      return json({ success: true });
    } catch (invalidationError) {
      console.error("Cache invalidation error:", invalidationError);
      // Return a 200 status to prevent WooCommerce from retrying
      return json({ 
        status: "warning", 
        message: "Authentication successful but cache invalidation failed",
        error: String(invalidationError)
      }, { status: 200 });
    }
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