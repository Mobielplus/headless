// app/routes/_index.tsx
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getHomepageCategories, type ProductCategory } from "~/lib/graphql/categories";
import { getHomepageBrands, type ProductBrand } from "~/lib/graphql/brands";
import { getFeaturedProducts, type FeaturedProduct } from "~/lib/graphql/products";
import { links as categoryCardLinks, CategorySection } from "~/components/CategoryCard/CategoryCard";
import { links as brandCardLinks, BrandSection } from "~/components/BrandCard/BrandCard";
import HomepageBanner, { links as homepageBannerLinks } from "~/components/HomepageBanner/HomepageBanner";
import { FeaturedDealsSection, links as featuredDealsSectionLinks } from "~/components/FeaturedDealsSection/FeaturedDealsSection";

interface LoaderData {
  categories: ProductCategory[];
  brands: ProductBrand[];
  featuredProducts: FeaturedProduct[];
}

export const loader: LoaderFunction = async () => {
  try {
    const [categories, brands, featuredProducts] = await Promise.all([
      getHomepageCategories(),
      getHomepageBrands(),
      getFeaturedProducts()
    ]);
    
    return json<LoaderData>(
      { categories, brands, featuredProducts },
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
    console.error("Error loading homepage data:", error);
    return json<LoaderData>({ categories: [], brands: [], featuredProducts: [] });
  }
};

export const links = () => [
  ...categoryCardLinks(),
  ...brandCardLinks(),
  ...homepageBannerLinks(),
  ...featuredDealsSectionLinks()
];

export default function Index() {
  const { categories, brands, featuredProducts } = useLoaderData<LoaderData>();

  return (
    <div className="page-wrapper">
      {/* Homepage Banner */}
      <HomepageBanner />
      
      {/* Categories Section */}
      <CategorySection categories={categories} />
      
      {/* Brands Section */}
      <BrandSection brands={brands} />

      {/* Featured Products Section */}
      <FeaturedDealsSection products={featuredProducts} />
    </div>
  );
}