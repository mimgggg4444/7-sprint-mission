import { create } from 'superstruct';
import { prismaClient } from '../lib/prismaClient.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import ForbiddenError from '../lib/errors/ForbiddenError.js';
import { IdParamsStruct } from '../structs/commonStructs.js';
import {
  CreateProductBodyStruct,
  GetProductListParamsStruct,
  UpdateProductBodyStruct,
} from '../structs/productsStruct.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentsStruct.js';

export async function createProduct(req, res) {
  const { name, description, price, tags, images } = create(req.body, CreateProductBodyStruct);

  const product = await prismaClient.product.create({
    data: { name, description, price, tags, images, userId: req.user.userId },
  });

  res.status(201).send(product);
}

export async function getProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);

  const product = await prismaClient.product.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, nickname: true, image: true }
      },
      _count: {
        select: { productLikes: true }
      }
    }
  });

  if (!product) {
    throw new NotFoundError('product', id);
  }

  let isLiked = false;
  if (req.user) {
    const like = await prismaClient.productLike.findUnique({
      where: {
        userId_productId: {
          userId: req.user.userId,
          productId: id,
        }
      }
    });
    isLiked = !!like;
  }

  const response = {
    ...product,
    likeCount: product._count.productLikes,
    isLiked,
  };
  delete response._count;

  return res.send(response);
}

export async function updateProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const { name, description, price, tags, images } = create(req.body, UpdateProductBodyStruct);

  const existingProduct = await prismaClient.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new NotFoundError('product', id);
  }

  if (existingProduct.userId !== req.user.userId) {
    throw new ForbiddenError('You do not have permission to update this product');
  }

  const updatedProduct = await prismaClient.product.update({
    where: { id },
    data: { name, description, price, tags, images },
  });

  return res.send(updatedProduct);
}

export async function deleteProduct(req, res) {
  const { id } = create(req.params, IdParamsStruct);
  const existingProduct = await prismaClient.product.findUnique({ where: { id } });

  if (!existingProduct) {
    throw new NotFoundError('product', id);
  }

  if (existingProduct.userId !== req.user.userId) {
    throw new ForbiddenError('You do not have permission to delete this product');
  }

  await prismaClient.product.delete({ where: { id } });

  return res.status(204).send();
}

export async function getProductList(req, res) {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);

  const where = keyword
    ? {
        OR: [{ name: { contains: keyword } }, { description: { contains: keyword } }],
      }
    : undefined;
  const totalCount = await prismaClient.product.count({ where });
  const products = await prismaClient.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { id: 'desc' } : { id: 'asc' },
    where,
  });

  return res.send({
    list: products,
    totalCount,
  });
}

export async function createComment(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);

  const existingProduct = await prismaClient.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new NotFoundError('product', productId);
  }

  const comment = await prismaClient.comment.create({
    data: {
      productId,
      content,
      userId: req.user.userId
    }
  });

  return res.status(201).send(comment);
}

export async function toggleProductLike(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);

  const existingProduct = await prismaClient.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new NotFoundError('product', productId);
  }

  const existingLike = await prismaClient.productLike.findUnique({
    where: {
      userId_productId: {
        userId: req.user.userId,
        productId,
      }
    }
  });

  if (existingLike) {
    await prismaClient.productLike.delete({
      where: { id: existingLike.id }
    });
    return res.status(200).send({ message: 'Like removed', isLiked: false });
  } else {
    await prismaClient.productLike.create({
      data: {
        userId: req.user.userId,
        productId,
      }
    });
    return res.status(200).send({ message: 'Like added', isLiked: true });
  }
}

export async function getCommentList(req, res) {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const existingProduct = await prismaClient.product.findUnique({ where: { id: productId } });
  if (!existingProduct) {
    throw new NotFoundError('product', productId);
  }

  const commentsWithCursorComment = await prismaClient.comment.findMany({
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1,
    where: { productId },
  });
  const comments = commentsWithCursorComment.slice(0, limit);
  const cursorComment = commentsWithCursorComment[comments.length - 1];
  const nextCursor = cursorComment ? cursorComment.id : null;

  return res.send({
    list: comments,
    nextCursor,
  });
}
