// app/components/ProductCard/ProductCard.tsx
import { Link } from "@remix-run/react";
import type { Product } from "~/lib/graphql";
import styles from "./ProductCard.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      {product.image && (
        <img
          src={product.image.sourceUrl}
          alt={product.name}
          className="product-image"
        />
      )}
      <div className="product-content">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price" dangerouslySetInnerHTML={{ __html: product.price }} />
        {product.shortDescription && (
          <p className="product-description" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
        )}
      </div>
    </Link>
  );
}