// app/routes/api.invalidate-homepage-categories.ts
import { ActionFunction, json } from "@remix-run/node";
import { invalidateHomepageCategories } from "~/lib/graphql";
import * as crypto from 'crypto';

export const action: ActionFunction = async ({ request }) => {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    
    // Get all possible signature headers
    const wcWebhookSignature = request.headers.get("x-wc-webhook-signature");
    const vercelProxySignature = request.headers.get("x-vercel-proxy-signature")?.replace('Bearer ', '');
    const SECRET_KEY = process.env.WEBHOOK_SECRET;
    
    // Validate presence of signature and secret
    if (!SECRET_KEY) {
      console.error("WEBHOOK_SECRET is missing");
      return json({ error: "Unauthorized - No secret key" }, { status: 401 });
    }
    
    // Detailed signature verification methods with logging
    const signatureVerificationMethods = [
      {
        name: "Standard Base64",
        method: () => crypto
          .createHmac('sha256', SECRET_KEY)
          .update(rawBody)
          .digest('base64'),
        logDetails: () => `Raw body length: ${rawBody.length}, First 50 chars: ${rawBody.substring(0, 50)}`
      },
      {
        name: "UTF-8 Buffer Base64",
        method: () => crypto
          .createHmac('sha256', SECRET_KEY)
          .update(Buffer.from(rawBody, 'utf8'))
          .digest('base64'),
        logDetails: () => `Raw body UTF-8 buffer, length: ${Buffer.from(rawBody, 'utf8').length}`
      },
      {
        name: "Hex Digest",
        method: () => crypto
          .createHmac('sha256', SECRET_KEY)
          .update(rawBody)
          .digest('hex'),
        logDetails: () => `Hex digest method`
      }
    ];
    
    // Signature verification tracking
    const verificationAttempts: any[] = [];
    
    // Check WooCommerce webhook signature
    if (wcWebhookSignature) {
      console.log("Attempting signature verification for WooCommerce webhook");
      
      for (const sigMethod of signatureVerificationMethods) {
        try {
          const expectedSignature = sigMethod.method();
          
          console.log(`Trying ${sigMethod.name} method:`, {
            receivedSignature: wcWebhookSignature,
            expectedSignature,
            additionalDetails: sigMethod.logDetails()
          });
          
          const isMatch = crypto.timingSafeEqual(
            Buffer.from(wcWebhookSignature),
            Buffer.from(expectedSignature)
          );
          
          verificationAttempts.push({
            method: sigMethod.name,
            match: isMatch,
            receivedSignature: wcWebhookSignature,
            expectedSignature
          });
          
          if (isMatch) {
            console.log(`✅ Signature verified using ${sigMethod.name} method`);
            break;
          }
        } catch (verificationError) {
          console.error(`Error in ${sigMethod.name} verification:`, verificationError);
          verificationAttempts.push({
            method: sigMethod.name,
            error: String(verificationError)
          });
        }
      }
    }
    
    // Log detailed verification attempts
    console.log("Signature Verification Attempts:", JSON.stringify(verificationAttempts, null, 2));
    
    // Check if any method succeeded
    const isSignatureValid = verificationAttempts.some(attempt => attempt.match === true);
    
    // If signature is invalid, return unauthorized
    if (!isSignatureValid) {
      console.error("Signature verification failed", {
        attempts: verificationAttempts,
        receivedSignature: wcWebhookSignature
      });
      return json({ 
        error: "Unauthorized - Invalid signature",
        verificationAttempts 
      }, { status: 401 });
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
        message: "Homepage categories cache invalidated",
        verificationAttempts
      });
    } catch (invalidationError) {
      console.error("Cache invalidation error:", invalidationError);
      
      // Return 200 to prevent WooCommerce from retrying
      return json({ 
        status: "warning", 
        message: "Authentication successful but cache invalidation failed",
        error: String(invalidationError),
        verificationAttempts
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