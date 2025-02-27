// app/routes/api.invalidate-category-archive.ts
import { ActionFunction, json } from "@remix-run/node";
import { invalidateCategoryProducts } from "~/lib/graphql";
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
    if (signature !== expectedSignature) {
      console.error("Invalid signature. Authentication failed.");
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse the request body as JSON
    const payload = JSON.parse(rawBody);
    console.log("Processing webhook payload for:", payload.name || "unknown product");
    
    try {
      // For product updates, determine which categories it belongs to
      if (payload.categories && Array.isArray(payload.categories)) {
        for (const category of payload.categories) {
          if (category.slug) {
            try {
              await invalidateCategoryProducts(category.slug);
              console.log(`Invalidated cache for category: ${category.slug}`);
            } catch (cacheError) {
              console.error(`Error invalidating cache for category ${category.slug}:`, cacheError);
              // Continue with other categories even if one fails
            }
          }
        }
      }
      
      // Return success even if cache invalidation had some issues
      // This prevents WooCommerce from retrying which could lead to more failures
      return json({ success: true });
    } catch (processingError) {
      console.error("Error processing webhook payload:", processingError);
      // Return a 200 status to prevent WooCommerce from retrying
      return json({ 
        status: "error", 
        message: "Error in webhook handler but request was valid",
        error: String(processingError)
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