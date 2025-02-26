// app/routes/api.invalidate-homepage-categories.ts
import { ActionFunction, json } from "@remix-run/node";
import { invalidateHomepageCategories } from "~/lib/graphql";
import crypto from 'crypto';

export const action: ActionFunction = async ({ request }) => {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    
    // Get the signature from headers
    const signature = request.headers.get("X-WC-Webhook-Signature");
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
    
    // Compare signatures (constant-time comparison to prevent timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    
    if (!isValid) {
      console.error("Invalid signature");
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // If we reach here, the signature is valid
    console.log("Webhook authenticated successfully");
    
    // Parse the request body as JSON (need to re-parse since we already consumed it)
    const payload = JSON.parse(rawBody);
    
    // Invalidate the cache
    await invalidateHomepageCategories();
    console.log("Invalidated homepage categories cache");
    
    return json({ success: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return json({ error: "Failed to process webhook" }, { status: 500 });
  }
};