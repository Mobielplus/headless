// app/components/FeaturedDealsSection/FeaturedDealsSection.tsx
import { Link } from "@remix-run/react";
import type { FeaturedProduct } from "~/lib/graphql/products";
import styles from "./FeaturedDealsSection.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

interface FeaturedDealsSectionProps {
  products: FeaturedProduct[];
}

export function FeaturedDealsSection({ products }: FeaturedDealsSectionProps) {
  return (
    <div className="deals-wrapper">
      <section className="deals-section">
        <h2 className="section-title">Onze beste deals</h2>
        <div className="deals-container">
          {products.map((product) => (
            <Link 
              to={product.uri || `/product/${product.slug}`} 
              className="deal-card" 
              key={product.slug}
            >
              <div className="bestseller-badge">Bestseller</div>
              {product.image && (
                <img
                  src={product.image.sourceUrl}
                  alt={product.image.altText || product.name}
                  className="product-image"
                />
              )}
              <div className="product-content">
                <h3 className="product-title">{product.name}</h3>
                <div className="product-content-bottom">
                  <div className="price-container">
                    {/* Only show regular price if there's a sale price */}
                    {product.salePriceRaw && (
                      <span className="regular-price">
                        Normaal € {product.regularPriceRaw} <i className="Info-icon"></i>
                      </span>
                    )}
                    <span className="sale-price">
                      € {product.salePriceRaw || product.regularPriceRaw}
                    </span>
                  </div>
                  <div className="stock-status">
                    {product.stockStatus === "IN_STOCK" && (
                      <span className="in-stock"><i className="Checkmark-icon"></i> Op voorraad</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}