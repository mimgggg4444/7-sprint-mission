import { Request, Response } from 'express';
import { create } from 'superstruct';
import { productService } from '../services/productService.js';
import { IdParamsStruct } from '../structs/commonStructs.js';
import {
  CreateProductBodyStruct,
  GetProductListParamsStruct,
  UpdateProductBodyStruct,
} from '../structs/productsStruct.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentsStruct.js';

export async function createProduct(req: Request, res: Response): Promise<void> {
  const { name, description, price, tags, images } = create(req.body, CreateProductBodyStruct);

  const product = await productService.createProduct({
    name,
    description,
    price,
    tags,
    images,
    userId: req.user!.userId,
  });

  res.status(201).send(product);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);

  const product = await productService.getProduct(id, req.user?.userId);
  res.send(product);
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);
  const data = create(req.body, UpdateProductBodyStruct);

  const updatedProduct = await productService.updateProduct(id, req.user!.userId, data);
  res.send(updatedProduct);
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);

  await productService.deleteProduct(id, req.user!.userId);
  res.status(204).send();
}

export async function getProductList(req: Request, res: Response): Promise<void> {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetProductListParamsStruct);

  const result = await productService.getProductList({ page, pageSize, orderBy, keyword });
  res.send(result);
}

export async function createComment(req: Request, res: Response): Promise<void> {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);

  const comment = await productService.createComment(productId, req.user!.userId, content);
  res.status(201).send(comment);
}

export async function getCommentList(req: Request, res: Response): Promise<void> {
  const { id: productId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const result = await productService.getCommentList(productId, cursor, limit);
  res.send(result);
}

export async function toggleProductLike(req: Request, res: Response): Promise<void> {
  const { id: productId } = create(req.params, IdParamsStruct);

  const result = await productService.toggleLike(productId, req.user!.userId);
  res.status(200).send(result);
}
