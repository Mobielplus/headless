// app/routes/api.invalidate-homepage-categories.ts
import { ActionFunction, json } from "@remix-run/node";
import { invalidateHomepageCategories } from "~/lib/graphql";
import * as crypto from 'crypto';

// Define interfaces for type safety
interface WebhookCategory {
  id: number;
  name: string;
  slug: string;
}

interface WebhookPayload {
  id: number;
  name: string;
  type?: string;
  categories?: WebhookCategory[];
}

export const action: ActionFunction = async ({ request }) => {
  // Start a timestamp for performance tracking
  const startTime = Date.now();
  
  // Placeholder for payload to use in error handling
  let payload: WebhookPayload = { id: 0, name: '' };
  
  try {
    // Log all headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
      console.log(`Header ${key}: ${value}`);
    });
    
    // Get the raw body for signature verification
    const rawBody = await request.text();
    
    // Check all possible signature header variations
    const signatureHeaders = [
      "x-wc-webhook-signature",
      "x-webhook-signature",
      "x-signature",
      "x-vercel-proxy-signature"
    ];
    
    let signature: string | null = null;
    for (const headerName of signatureHeaders) {
      signature = request.headers.get(headerName);
      if (signature) {
        console.log(`Found signature in header: ${headerName}`);
        break;
      }
    }
    
    const SECRET_KEY = process.env.WEBHOOK_SECRET;
    
    // Validate presence of signature and secret
    if (!signature || !SECRET_KEY) {
      console.error("Missing signature or secret key", {
        signaturePresent: !!signature,
        secretKeyPresent: !!SECRET_KEY,
        checkedHeaders: signatureHeaders
      });
      return json({ 
        error: "Unauthorized", 
        details: {
          headers,
          checkedHeaders: signatureHeaders
        }
      }, { status: 401 });
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
      return json({ error: "Unauthorized - Signature mismatch" }, { status: 401 });
    }
    
    // Log webhook details for debugging
    console.log("Webhook headers:", {
      event: request.headers.get("x-wc-webhook-event"),
      resource: request.headers.get("x-wc-webhook-resource"),
      topic: request.headers.get("x-wc-webhook-topic")
    });
    
    try {
      // Parse the request body as JSON
      payload = JSON.parse(rawBody);
      console.log("Processing webhook payload:", {
        payloadType: payload.type || 'unknown',
        payloadName: payload.name || 'unnamed',
        productId: payload.id,
        categories: payload.categories?.map((cat: WebhookCategory) => cat.slug)
      });
      
      // Log before invalidation
      console.log("[BEFORE] Attempting to invalidate homepage categories cache");
      
      // Capture start time of invalidation
      const invalidationStartTime = Date.now();
      
      // Invalidate homepage categories cache
      await invalidateHomepageCategories();
      
      // Calculate invalidation duration
      const invalidationDuration = Date.now() - invalidationStartTime;
      
      console.log("[SUCCESS] Homepage categories cache invalidation:", {
        message: "Successfully invalidated homepage categories cache",
        duration: `${invalidationDuration}ms`,
        product: payload.name || 'Unknown Product',
        productId: payload.id
      });
      
      // Calculate total webhook processing time
      const totalProcessingTime = Date.now() - startTime;
      
      return json({ 
        success: true,
        message: "Homepage categories cache invalidated",
        processingTime: `${totalProcessingTime}ms`,
        invalidationDuration: `${invalidationDuration}ms`
      });
    } catch (invalidationError) {
      console.error("[ERROR] Cache invalidation failed:", {
        error: String(invalidationError),
        product: payload.name || 'Unknown Product',
        productId: payload.id
      });
      
      // Return 200 to prevent WooCommerce from retrying
      return json({ 
        status: "warning", 
        message: "Authentication successful but cache invalidation failed",
        error: String(invalidationError)
      }, { status: 200 });
    }
  } catch (error) {
    console.error("[FATAL] Webhook handler error:", {
      error: String(error),
      timestamp: new Date().toISOString()
    });
    
    // Always return 200 to prevent retries
    return json({ 
      status: "error", 
      message: "Fatal error in webhook handler",
      error: String(error)
    }, { status: 200 });
  }
};