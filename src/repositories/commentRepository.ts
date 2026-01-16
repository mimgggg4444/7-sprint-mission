import { prismaClient } from '../lib/prismaClient.js';
import { Comment, Prisma } from '@prisma/client';

export interface CommentListParams {
  cursor?: number;
  limit: number;
  productId?: number;
  articleId?: number;
}

export const commentRepository = {
  async findById(id: number): Promise<Comment | null> {
    return prismaClient.comment.findUnique({
      where: { id },
    });
  },

  async findMany(params: CommentListParams) {
    const { cursor, limit, productId, articleId } = params;

    const where = productId ? { productId } : { articleId };

    const comments = await prismaClient.comment.findMany({
      cursor: cursor ? { id: cursor } : undefined,
      take: limit + 1,
      where,
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = comments.length > limit;
    const result = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? result[result.length - 1]?.id : null;

    return { list: result, nextCursor };
  },

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return prismaClient.comment.create({
      data,
    });
  },

  async update(id: number, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return prismaClient.comment.update({
      where: { id },
      data,
    });
  },

  async delete(id: number): Promise<Comment> {
    return prismaClient.comment.delete({
      where: { id },
    });
  },
};
