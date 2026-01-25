// Admin API client for submitting scraped products
import axios from 'axios';

export interface ProductPayload {
  department: {
    name: string;
    slug: string;
    sortOrder?: number;
  };
  category: {
    name: string;
    slug: string;
    fullSlug: string;
  };
  product: {
    asin: string;
    name: string;
    price: number | null;
    imageUrl: string | null;
    amazonUrl: string;
    rating: number | null;
    reviewCount: number | null;
  };
}

export interface ApiResponse {
  success: boolean;
  data?: {
    departmentId: string;
    categoryId: string;
    productId: string;
    product: {
      asin: string;
      name: string;
    };
  };
  error?: string;
}

export class AdminApiClient {
  private baseUrl: string;
  private secret: string;

  constructor(baseUrl: string, secret: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.secret = secret;
  }

  async submitProduct(payload: ProductPayload): Promise<ApiResponse> {
    try {
      const response = await axios.post<ApiResponse>(
        `${this.baseUrl}/api/admin/products`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.secret}`,
          },
          timeout: 30000,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        return { success: false, error: message };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export function createApiClient(): AdminApiClient {
  const baseUrl = process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.ADMIN_SECRET;

  if (!baseUrl) {
    throw new Error(
      'ADMIN_API_URL or NEXT_PUBLIC_SITE_URL environment variable is required'
    );
  }
  if (!secret) {
    throw new Error('ADMIN_SECRET environment variable is required');
  }

  return new AdminApiClient(baseUrl, secret);
}
