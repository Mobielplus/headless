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
  try {
    const products = await getProductsByCategory(params.categorySlug || "");
    return json<LoaderData>({ products });
  } catch (error) {
    return json<LoaderData>({ products: [] });
  }
};

export const links = () => [
  { rel: "stylesheet", href: styles },
  ...productCardLinks()
];

export default function CategoryPage() {
  const { products } = useLoaderData<LoaderData>();

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