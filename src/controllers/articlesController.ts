import { Request, Response } from 'express';
import { create } from 'superstruct';
import { articleService } from '../services/articleService.js';
import { IdParamsStruct } from '../structs/commonStructs.js';
import {
  CreateArticleBodyStruct,
  UpdateArticleBodyStruct,
  GetArticleListParamsStruct,
} from '../structs/articlesStructs.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentsStruct.js';

export async function createArticle(req: Request, res: Response): Promise<void> {
  const { title, content, image } = create(req.body, CreateArticleBodyStruct);

  const article = await articleService.createArticle({
    title,
    content,
    image,
    userId: req.user!.userId,
  });

  res.status(201).send(article);
}

export async function getArticle(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);

  const article = await articleService.getArticle(id, req.user?.userId);
  res.send(article);
}

export async function updateArticle(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);
  const data = create(req.body, UpdateArticleBodyStruct);

  const article = await articleService.updateArticle(id, req.user!.userId, data);
  res.send(article);
}

export async function deleteArticle(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);

  await articleService.deleteArticle(id, req.user!.userId);
  res.status(204).send();
}

export async function getArticleList(req: Request, res: Response): Promise<void> {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);

  const result = await articleService.getArticleList({ page, pageSize, orderBy, keyword });
  res.send(result);
}

export async function createComment(req: Request, res: Response): Promise<void> {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);

  const comment = await articleService.createComment(articleId, req.user!.userId, content);
  res.status(201).send(comment);
}

export async function getCommentList(req: Request, res: Response): Promise<void> {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const result = await articleService.getCommentList(articleId, cursor, limit);
  res.send(result);
}

export async function toggleArticleLike(req: Request, res: Response): Promise<void> {
  const { id: articleId } = create(req.params, IdParamsStruct);

  const result = await articleService.toggleLike(articleId, req.user!.userId);
  res.status(200).send(result);
}
