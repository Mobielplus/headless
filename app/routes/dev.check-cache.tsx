// app/routes/dev.check-cache.tsx
import { LoaderFunction, json } from "@remix-run/node";
import { redis } from "~/lib/redis.server";

export const loader: LoaderFunction = async ({ request }) => {
  // Optional: Add password protection for this route
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  
  if (!key) {
    return json({ 
      availableKeys: {
        homepage: "homepage:categories",
        categoryExample: "products:category:your-category-slug:first24"
      }
    });
  }
  
  try {
    const value = await redis.get(key);
    const exists = value !== null;
    
    return json({
      key,
      exists,
      data: exists ? JSON.parse(value) : null
    });
  } catch (error) {
    return json({ error: String(error) }, { status: 500 });
  }
};