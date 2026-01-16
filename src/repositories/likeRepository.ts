import { prismaClient } from '../lib/prismaClient.js';
import { ProductLike, ArticleLike } from '@prisma/client';

export const likeRepository = {
  // Product Likes
  async findProductLike(userId: number, productId: number): Promise<ProductLike | null> {
    return prismaClient.productLike.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
  },

  async createProductLike(userId: number, productId: number): Promise<ProductLike> {
    return prismaClient.productLike.create({
      data: { userId, productId },
    });
  },

  async deleteProductLike(id: number): Promise<ProductLike> {
    return prismaClient.productLike.delete({
      where: { id },
    });
  },

  async findUserFavoriteProducts(userId: number) {
    const favorites = await prismaClient.productLike.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.product);
  },

  // Article Likes
  async findArticleLike(userId: number, articleId: number): Promise<ArticleLike | null> {
    return prismaClient.articleLike.findUnique({
      where: {
        userId_articleId: { userId, articleId },
      },
    });
  },

  async createArticleLike(userId: number, articleId: number): Promise<ArticleLike> {
    return prismaClient.articleLike.create({
      data: { userId, articleId },
    });
  },

  async deleteArticleLike(id: number): Promise<ArticleLike> {
    return prismaClient.articleLike.delete({
      where: { id },
    });
  },
};
