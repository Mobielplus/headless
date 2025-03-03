// app/components/CategoryCard/CategoryCard.tsx
import { Link } from "@remix-run/react";
import type { ProductCategory } from "~/lib/graphql/categories";
import styles from "./CategoryCard.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

interface CategoryCardProps {
  category: ProductCategory;
}

// Individual CategoryCard component
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

// CategorySection that includes wrapper, title, and cards
interface CategorySectionProps {
  categories: ProductCategory[];
  title?: string;
}

export function CategorySection({ 
  categories, 
  title = "Kies een categorie" 
}: CategorySectionProps) {
  return (
    <div className="categories-wrapper">
      <section className="categories-section">
        <h2 className="section-title">{title}</h2>
        <div className="categories-container">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}