// app/components/BrandCard/BrandCard.tsx
import { Link } from "@remix-run/react";
// Import ProductBrand directly from types file to avoid circular references
import type { ProductBrand } from "../../lib/graphql/brands";
import styles from "./BrandCard.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

interface BrandCardProps {
  brand: ProductBrand;
}

// Individual BrandCard component
export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link to={`/brand/${brand.slug}`} className="brand-card">
      {brand.imageUrl && (
        <img
          src={brand.imageUrl}
          alt={brand.name}
          className="brand-image"
        />
      )}
      <div className="brand-content">
        <h2 className="brand-title">{brand.name}</h2>
        <p className="description">{brand.description || 'No description available'}</p>
      </div>
    </Link>
  );
}

// BrandSection that includes wrapper, title, and cards
interface BrandSectionProps {
  brands: ProductBrand[];
  title?: string;
}

export function BrandSection({ 
  brands, 
  title = "Onze merken" 
}: BrandSectionProps) {
  return (
    <div className="brands-wrapper">
      <section className="brands-section">
        <h2 className="section-title">{title}</h2>
        <div className="brands-container">
          {brands.map((brand) => (
            <BrandCard key={brand.slug} brand={brand} />
          ))}
        </div>
      </section>
    </div>
  );
}