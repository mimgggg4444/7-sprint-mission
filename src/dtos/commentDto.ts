import { Comment } from '@prisma/client';

// Request DTOs
export interface CreateCommentDto {
  content: string;
}

export interface UpdateCommentDto {
  content?: string;
}

export interface CommentListQueryDto {
  cursor?: number;
  limit: number;
}

// Response DTOs
export interface CommentListResponseDto {
  list: Comment[];
  nextCursor: number | null;
}

export interface LikeToggleResponseDto {
  message: string;
  isLiked: boolean;
}
