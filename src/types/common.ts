import { User, Product, Article, Comment } from '@prisma/client';

// User without password
export type SafeUser = Omit<User, 'password' | 'refreshToken'>;

// Pagination params
export interface PageParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  keyword?: string;
}

export interface CursorParams {
  cursor?: number;
  limit?: number;
}

// Response types
export interface PaginatedResponse<T> {
  list: T[];
  totalCount: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

// Product with like info
export interface ProductWithLikes extends Product {
  likeCount: number;
  isLiked: boolean;
}

// Article with like info
export interface ArticleWithLikes extends Article {
  likeCount: number;
  isLiked: boolean;
}

// Comment with user info
export interface CommentWithUser extends Comment {
  user: Pick<User, 'id' | 'nickname' | 'image'>;
}
