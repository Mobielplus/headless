// app/routes/api.invalidate-category-archive.ts
import { ActionFunction, json } from "@remix-run/node";
import { invalidateCategoryProducts } from "~/lib/graphql";
import * as crypto from 'crypto';

export const action: ActionFunction = async ({ request }) => {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Get webhook signature and secret
    const signature = request.headers.get("x-wc-webhook-signature");
    const SECRET_KEY = process.env.WEBHOOK_SECRET;
    
    // Validate presence of signature and secret
    if (!signature || !SECRET_KEY) {
      console.error("Missing signature or secret key", {
        signaturePresent: !!signature,
        secretKeyPresent: !!SECRET_KEY
      });
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(rawBody)
      .digest('base64');
    
    // Timing-safe comparison
    const signatureMatch = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    
    if (!signatureMatch) {
      console.error("Signature verification failed", {
        receivedSignature: signature,
        expectedSignature
      });
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    console.log(`Processing webhook for product: ${payload.name}`);
    
    // Invalidate cache for product categories
    if (payload.categories && payload.categories.length > 0) {
      for (const category of payload.categories) {
        try {
          await invalidateCategoryProducts(category.slug);
          console.log(`Invalidated cache for category: ${category.slug}`);
        } catch (error) {
          console.error(`Error invalidating cache for ${category.slug}:`, error);
        }
      }
    }
    
    return json({ success: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return json({ 
      status: "error", 
      message: "Error processing webhook",
      error: String(error)
    }, { status: 200 }); // Return 200 to prevent retries
  }
};