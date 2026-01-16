import { prismaClient } from '../lib/prismaClient.js';
import { Article, Prisma } from '@prisma/client';

export interface ArticleListParams {
  page: number;
  pageSize: number;
  orderBy?: string;
  keyword?: string;
}

export const articleRepository = {
  async findById(id: number) {
    return prismaClient.article.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, nickname: true, image: true },
        },
        _count: {
          select: { articleLikes: true },
        },
      },
    });
  },

  async findByIdSimple(id: number): Promise<Article | null> {
    return prismaClient.article.findUnique({
      where: { id },
    });
  },

  async findMany(params: ArticleListParams) {
    const { page, pageSize, orderBy, keyword } = params;

    const where = {
      title: keyword ? { contains: keyword } : undefined,
    };

    const [totalCount, articles] = await Promise.all([
      prismaClient.article.count({ where }),
      prismaClient.article.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
        where,
      }),
    ]);

    return { list: articles, totalCount };
  },

  async create(data: Prisma.ArticleCreateInput): Promise<Article> {
    return prismaClient.article.create({
      data,
    });
  },

  async update(id: number, data: Prisma.ArticleUpdateInput): Promise<Article> {
    return prismaClient.article.update({
      where: { id },
      data,
    });
  },

  async delete(id: number): Promise<Article> {
    return prismaClient.article.delete({
      where: { id },
    });
  },
};
