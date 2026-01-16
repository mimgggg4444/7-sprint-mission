import { prismaClient } from '../lib/prismaClient.js';
import { Product, Prisma } from '@prisma/client';

export interface ProductListParams {
  page: number;
  pageSize: number;
  orderBy?: string;
  keyword?: string;
}

export const productRepository = {
  async findById(id: number) {
    return prismaClient.product.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, nickname: true, image: true },
        },
        _count: {
          select: { productLikes: true },
        },
      },
    });
  },

  async findByIdSimple(id: number): Promise<Product | null> {
    return prismaClient.product.findUnique({
      where: { id },
    });
  },

  async findMany(params: ProductListParams) {
    const { page, pageSize, orderBy, keyword } = params;

    const where = keyword
      ? {
          OR: [{ name: { contains: keyword } }, { description: { contains: keyword } }],
        }
      : undefined;

    const [totalCount, products] = await Promise.all([
      prismaClient.product.count({ where }),
      prismaClient.product.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy === 'recent' ? { id: 'desc' } : { id: 'asc' },
        where,
      }),
    ]);

    return { list: products, totalCount };
  },

  async findByUserId(userId: number): Promise<Product[]> {
    return prismaClient.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prismaClient.product.create({
      data,
    });
  },

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prismaClient.product.update({
      where: { id },
      data,
    });
  },

  async delete(id: number): Promise<Product> {
    return prismaClient.product.delete({
      where: { id },
    });
  },
};
