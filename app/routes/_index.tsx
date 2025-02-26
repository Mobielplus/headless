// app/routes/_index.tsx
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getHomepageCategories, type ProductCategory } from "~/lib/graphql";
import { CategoryCard, links as categoryCardLinks } from "~/components/CategoryCard/CategoryCard";
import HomepageBanner, { links as homepageBannerLinks } from "~/components/HomepageBanner/HomepageBanner";

interface LoaderData {
  categories: ProductCategory[];
}

export const loader: LoaderFunction = async () => {
  try {
    const categories = await getHomepageCategories();
    
    return json<LoaderData>(
      { categories },
      {
        headers: {
          // ISR-like pattern:
          // - Cache for 1 hour (s-maxage)
          // - Allow serving stale content while revalidating in background
          // - Store in shared cache (CDN)
          "Cache-Control": "s-maxage=3600, stale-while-revalidate, public"
        }
      }
    );
  } catch (error) {
    return json<LoaderData>({ categories: [] });
  }
};

export const links = () => [
  ...categoryCardLinks(),
  ...homepageBannerLinks()
];

export default function Index() {
  const { categories } = useLoaderData<LoaderData>();

  return (
    <div className="page-wrapper">
      {/* HomepageBanner positioned above the categories */}
      <div className="banner-wrapper">
        <HomepageBanner />
      </div>
      
      <div className="categories-wrapper">
        <section className="categories-section">
          <h2 className="section-title">Kies een categorie</h2>
          <div className="categories-container">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}