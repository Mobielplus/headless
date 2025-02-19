// app/components/CategoryCard/CategoryCard.tsx
import { Link } from "@remix-run/react";
import type { ProductCategory } from "~/lib/graphql";
import styles from "./CategoryCard.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

interface CategoryCardProps {
  category: ProductCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/${category.slug}`} className="category-card">
      {category.image && (
        <img
          src={category.image.sourceUrl}
          alt={category.image.altText || category.name}
          className="category-image"
        />
      )}
      <div className="category-content">
        <h2 className="category-title">{category.name}</h2>
      </div>
    </Link>
  );
}