import { productRepository, ProductListParams } from '../repositories/productRepository.js';
import { commentRepository } from '../repositories/commentRepository.js';
import { likeRepository } from '../repositories/likeRepository.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import ForbiddenError from '../lib/errors/ForbiddenError.js';

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  tags: string[];
  images: string[];
  userId: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  tags?: string[];
  images?: string[];
}

export const productService = {
  async createProduct(data: CreateProductData) {
    return productRepository.create({
      name: data.name,
      description: data.description,
      price: data.price,
      tags: data.tags,
      images: data.images,
      user: { connect: { id: data.userId } },
    });
  },

  async getProduct(id: number, userId?: number) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('product', id);
    }

    let isLiked = false;
    if (userId) {
      const like = await likeRepository.findProductLike(userId, id);
      isLiked = !!like;
    }

    const { _count, ...productData } = product;
    return {
      ...productData,
      likeCount: _count.productLikes,
      isLiked,
    };
  },

  async updateProduct(id: number, userId: number, data: UpdateProductData) {
    const existingProduct = await productRepository.findByIdSimple(id);
    if (!existingProduct) {
      throw new NotFoundError('product', id);
    }

    if (existingProduct.userId !== userId) {
      throw new ForbiddenError('You do not have permission to update this product');
    }

    return productRepository.update(id, data);
  },

  async deleteProduct(id: number, userId: number) {
    const existingProduct = await productRepository.findByIdSimple(id);
    if (!existingProduct) {
      throw new NotFoundError('product', id);
    }

    if (existingProduct.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this product');
    }

    await productRepository.delete(id);
  },

  async getProductList(params: ProductListParams) {
    return productRepository.findMany(params);
  },

  async createComment(productId: number, userId: number, content: string) {
    const existingProduct = await productRepository.findByIdSimple(productId);
    if (!existingProduct) {
      throw new NotFoundError('product', productId);
    }

    return commentRepository.create({
      content,
      user: { connect: { id: userId } },
      product: { connect: { id: productId } },
    });
  },

  async getCommentList(productId: number, cursor: number, limit: number) {
    const existingProduct = await productRepository.findByIdSimple(productId);
    if (!existingProduct) {
      throw new NotFoundError('product', productId);
    }

    return commentRepository.findMany({ cursor, limit, productId });
  },

  async toggleLike(productId: number, userId: number) {
    const existingProduct = await productRepository.findByIdSimple(productId);
    if (!existingProduct) {
      throw new NotFoundError('product', productId);
    }

    const existingLike = await likeRepository.findProductLike(userId, productId);

    if (existingLike) {
      await likeRepository.deleteProductLike(existingLike.id);
      return { message: 'Like removed', isLiked: false };
    } else {
      await likeRepository.createProductLike(userId, productId);
      return { message: 'Like added', isLiked: true };
    }
  },
};
