// app/routes/api.invalidate-homepage-categories.ts
import { ActionFunction, json } from "@remix-run/node";
import { invalidateHomepageCategories } from "~/lib/graphql";
import * as crypto from 'crypto';

export const action: ActionFunction = async ({ request }) => {
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
      const payload = JSON.parse(rawBody);
      console.log("Processing webhook payload:", {
        payloadType: payload.type || 'unknown',
        payloadName: payload.name || 'unnamed'
      });
      
      // Invalidate homepage categories cache
      await invalidateHomepageCategories();
      console.log("Successfully invalidated homepage categories cache");
      
      return json({ 
        success: true,
        message: "Homepage categories cache invalidated"
      });
    } catch (invalidationError) {
      console.error("Cache invalidation error:", invalidationError);
      
      // Return 200 to prevent WooCommerce from retrying
      return json({ 
        status: "warning", 
        message: "Authentication successful but cache invalidation failed",
        error: String(invalidationError)
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Webhook handler fatal error:", error);
    
    // Always return 200 to prevent retries
    return json({ 
      status: "error", 
      message: "Fatal error in webhook handler",
      error: String(error)
    }, { status: 200 });
  }
};