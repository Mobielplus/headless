// ------------ brands.ts ------------
import { graphQLRequest, PaginatedResponse } from './client';

// Types
export interface ProductBrand {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  showOnHomepage: boolean;
}

export interface ProductBrandsResponse {
  homepageProductBrands: ProductBrand[];
}

// Queries
export const GET_HOMEPAGE_BRANDS = `
  query GetHomepageBrands {
    homepageProductBrands(showOnHomepage: true) {
      name
      slug
      description
      imageUrl
      showOnHomepage
    }
  }
`;

export const GET_PRODUCTS_BY_BRAND = `
  query GetProductsByBrand($brandSlug: String!) {
    products(
      where: { brandIn: $brandSlug }
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
export async function getHomepageBrands(): Promise<ProductBrand[]> {
  const data = await graphQLRequest<ProductBrandsResponse>(GET_HOMEPAGE_BRANDS);
  return data.homepageProductBrands;
}

export async function getProductsByBrand(brandSlug: string): Promise<any[]> {
  const variables = { brandSlug };
  const data = await graphQLRequest<any>(GET_PRODUCTS_BY_BRAND, variables);
  return data.products.nodes;
}

export async function invalidateHomepageBrands(): Promise<void> {
  console.log('[GraphQL] Homepage brands refresh requested');
  // Placeholder for future cache invalidation
}
