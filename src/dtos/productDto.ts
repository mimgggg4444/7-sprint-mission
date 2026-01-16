import { Product } from '@prisma/client';

// Request DTOs
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  tags: string[];
  images: string[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  tags?: string[];
  images?: string[];
}

export interface ProductListQueryDto {
  page: number;
  pageSize: number;
  orderBy?: string;
  keyword?: string;
}

// Response DTOs
export interface ProductResponseDto extends Product {
  likeCount: number;
  isLiked: boolean;
  user: {
    id: number;
    nickname: string;
    image: string | null;
  };
}

export interface ProductListResponseDto {
  list: Product[];
  totalCount: number;
}
