export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string;
          name: string;
          slug: string;
          amazon_node_id: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          amazon_node_id?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          amazon_node_id?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          department_id: string | null;
          parent_category_id: string | null;
          name: string;
          slug: string;
          full_slug: string;
          amazon_url: string | null;
          depth: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          department_id?: string | null;
          parent_category_id?: string | null;
          name: string;
          slug: string;
          full_slug: string;
          amazon_url?: string | null;
          depth?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          department_id?: string | null;
          parent_category_id?: string | null;
          name?: string;
          slug?: string;
          full_slug?: string;
          amazon_url?: string | null;
          depth?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          asin: string;
          name: string;
          price: number | null;
          image_url: string | null;
          amazon_url: string;
          rating: number | null;
          review_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asin: string;
          name: string;
          price?: number | null;
          image_url?: string | null;
          amazon_url: string;
          rating?: number | null;
          review_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asin?: string;
          name?: string;
          price?: number | null;
          image_url?: string | null;
          amazon_url?: string;
          rating?: number | null;
          review_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bestseller_rankings: {
        Row: {
          id: string;
          product_id: string | null;
          category_id: string | null;
          became_number_one_at: string;
          is_current: boolean;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          category_id?: string | null;
          became_number_one_at?: string;
          is_current?: boolean;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          category_id?: string | null;
          became_number_one_at?: string;
          is_current?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type Department = Database['public']['Tables']['departments']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type BestsellerRanking = Database['public']['Tables']['bestseller_rankings']['Row'];
