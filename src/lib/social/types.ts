/**
 * Common types for social media integrations.
 */

export type Platform = 'twitter' | 'instagram' | 'tiktok' | 'facebook';

export interface PostContent {
  text: string;
  imageUrl?: string;
  link?: string;
  hashtags?: string[];
}

export interface PostResult {
  success: boolean;
  platform: Platform;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface ProductPostData {
  productName: string;
  categoryName: string;
  departmentName: string;
  price: number | null;
  imageUrl: string | null;
  asin: string;
  affiliateUrl: string;
}
