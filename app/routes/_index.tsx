// app/routes/_index.tsx
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getHomepageCategories, type ProductCategory } from "~/lib/graphql";
import { CategoryCard, links as categoryCardLinks } from "~/components/CategoryCard/CategoryCard";

interface LoaderData {
  categories: ProductCategory[];
}

export const loader: LoaderFunction = async () => {
  try {
    const categories = await getHomepageCategories();
    return json<LoaderData>({ categories });
  } catch (error) {
    return json<LoaderData>({ categories: [] });
  }
};

export const links = () => [...categoryCardLinks()];

export default function Index() {
  const { categories } = useLoaderData<LoaderData>();

  return (
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
  );
}
