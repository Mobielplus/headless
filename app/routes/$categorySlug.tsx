// app/routes/$categorySlug.tsx
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getProductsByCategory, type Product } from "~/lib/graphql";
import { ProductCard, links as productCardLinks } from "~/components/ProductCard/ProductCard";
import styles from "~/styles/category.css?url";

interface LoaderData {
  products: Product[];
}

export const loader: LoaderFunction = async ({ params }) => {
  // Skip processing for favicon.ico and other browser resources
  const categorySlug = params.categorySlug || "";
  
  // List of common browser resources to ignore
  const ignoredResources = ["favicon.ico", "robots.txt", "sitemap.xml"];
  
  if (ignoredResources.includes(categorySlug)) {
    return json<LoaderData>({ products: [] });
  }
  
  try {
    const products = await getProductsByCategory(categorySlug);
    return json<LoaderData>({ products });
  } catch (error) {
    console.error(`Error loading products for category ${categorySlug}:`, error);
    return json<LoaderData>({ products: [] });
  }
};

export const links = () => [
  { rel: "stylesheet", href: styles },
  ...productCardLinks()
];

export default function CategoryPage() {
  const { products } = useLoaderData<LoaderData>();

  if (products.length === 0) {
    return (
      <div className="products-wrapper">
        <p>No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="products-wrapper">
      <section className="products-section">
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}