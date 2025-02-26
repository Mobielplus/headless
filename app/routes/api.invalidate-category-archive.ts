// app/routes/api.invalidate-category-archive.ts
import { ActionFunction, json } from "@remix-run/node";
import { invalidateCategoryProducts } from "~/lib/graphql";

export const action: ActionFunction = async ({ request }) => {
  // Verify webhook secret
  const SECRET_KEY = process.env.CATEGORY_ARCHIVE_WEBHOOK_SECRET;
  const authHeader = request.headers.get("Authorization");
  
  if (authHeader !== `Bearer ${SECRET_KEY}`) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const payload = await request.json();
    
    // For product updates, determine which categories it belongs to
    if (payload.product) {
      const categories = payload.product.categories || [];
      for (const category of categories) {
        await invalidateCategoryProducts(category.slug);
        console.log(`Invalidated cache for category: ${category.slug}`);
      }
    }
    
    // For direct category updates
    if (payload.product_cat && payload.product_cat.slug) {
      await invalidateCategoryProducts(payload.product_cat.slug);
      console.log(`Invalidated cache for category: ${payload.product_cat.slug}`);
    }
    
    return json({ success: true });
  } catch (error) {
    console.error("Cache invalidation error:", error);
    return json({ error: "Failed to invalidate cache" }, { status: 500 });
  }
};