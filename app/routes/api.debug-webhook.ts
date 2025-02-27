// app/routes/api.debug-webhook.ts
import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  try {
    // Clone the request to get both the raw body and headers
    const clonedRequest = request.clone();
    
    // Log all headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Get and log the raw body
    const rawBody = await clonedRequest.text();
    let bodyContent;
    
    try {
      // Try to parse as JSON
      bodyContent = JSON.parse(rawBody);
    } catch (e) {
      // If not JSON, just use the raw text
      bodyContent = { rawText: rawBody };
    }
    
    // Return all the debug information
    return json({
      message: "Debug information",
      headers: headers,
      body: bodyContent,
      method: request.method,
      url: request.url,
      // Include environment variables (redacted)
      env: {
        CATEGORY_ARCHIVE_WEBHOOK_SECRET: process.env.CATEGORY_ARCHIVE_WEBHOOK_SECRET ? "[PRESENT]" : "[MISSING]",
        HOMEPAGE_WEBHOOK_SECRET: process.env.HOMEPAGE_WEBHOOK_SECRET ? "[PRESENT]" : "[MISSING]"
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Debug webhook error:", error);
    return json({ 
      status: "error", 
      message: "Error in debug webhook handler",
      error: String(error)
    }, { status: 200 });
  }
};