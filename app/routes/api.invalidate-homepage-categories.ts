// app/routes/api.invalidate-homepage-categories.ts
import { ActionFunction, json } from "@remix-run/node";
import { invalidateHomepageCategories } from "~/lib/graphql";

export const action: ActionFunction = async ({ request }) => {
  // Verify webhook secret
  const SECRET_KEY = process.env.HOMEPAGE_WEBHOOK_SECRET;
  const authHeader = request.headers.get("Authorization");
  
  if (authHeader !== `Bearer ${SECRET_KEY}`) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    await invalidateHomepageCategories();
    console.log("Invalidated homepage categories cache");
    
    return json({ success: true });
  } catch (error) {
    console.error("Cache invalidation error:", error);
    return json({ error: "Failed to invalidate cache" }, { status: 500 });
  }
};