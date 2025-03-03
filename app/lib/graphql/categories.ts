// ------------ categories.ts ------------
import { graphQLRequest, PaginatedResponse, ImageData } from './client';
import { Product, ProductsResponse } from './products';

// Types
export interface ProductCategory {
  name: string;
  slug: string;
  description: string;
  image: ImageData | null;
  showOnHomepage: boolean;
}

export interface ProductCategoriesResponse {
  productCategories: PaginatedResponse<ProductCategory>;
}

// Queries
export const GET_HOMEPAGE_CATEGORIES = `
  query GetHomepageCategories {
    productCategories(
      where: { showOnHomepage: true }
    ) {
      nodes {
        name
        slug
        description
        image {
          sourceUrl
          altText
        }
        showOnHomepage
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory($categorySlug: [String]!) {
    products(
      where: { categoryIn: $categorySlug }
    ) {
      nodes {
        name
        slug
        shortDescription
        image {
          sourceUrl
        }
        ... on SimpleProduct {
          price
        }
        ... on VariableProduct {
          price
        }
      }
    }
  }
`;

// Services
export async function getHomepageCategories(): Promise<ProductCategory[]> {
  const data = await graphQLRequest<ProductCategoriesResponse>(GET_HOMEPAGE_CATEGORIES);
  return data.productCategories.nodes;
}

export async function getProductsByCategory(categorySlug: string): Promise<any[]> {
  const variables = { categorySlug: [categorySlug] };
  const data = await graphQLRequest<any>(GET_PRODUCTS_BY_CATEGORY, variables);
  return data.products.nodes;
}

export async function invalidateHomepageCategories(): Promise<void> {
  console.log('[GraphQL] Homepage categories refresh requested');
  // Placeholder for future cache invalidation
}