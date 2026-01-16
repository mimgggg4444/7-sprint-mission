import { Article } from '@prisma/client';

// Request DTOs
export interface CreateArticleDto {
  title: string;
  content: string;
  image: string | null;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  image?: string | null;
}

export interface ArticleListQueryDto {
  page: number;
  pageSize: number;
  orderBy?: string;
  keyword?: string;
}

// Response DTOs
export interface ArticleResponseDto extends Article {
  likeCount: number;
  isLiked: boolean;
  user: {
    id: number;
    nickname: string;
    image: string | null;
  };
}

export interface ArticleListResponseDto {
  list: Article[];
  totalCount: number;
}
