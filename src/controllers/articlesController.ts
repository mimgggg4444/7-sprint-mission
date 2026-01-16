import { Request, Response } from 'express';
import { create } from 'superstruct';
import { prismaClient } from '../lib/prismaClient.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import ForbiddenError from '../lib/errors/ForbiddenError.js';
import { IdParamsStruct } from '../structs/commonStructs.js';
import {
  CreateArticleBodyStruct,
  UpdateArticleBodyStruct,
  GetArticleListParamsStruct,
} from '../structs/articlesStructs.js';
import { CreateCommentBodyStruct, GetCommentListParamsStruct } from '../structs/commentsStruct.js';

export async function createArticle(req: Request, res: Response): Promise<void> {
  const data = create(req.body, CreateArticleBodyStruct);

  const article = await prismaClient.article.create({
    data: {
      ...data,
      userId: req.user!.userId
    }
  });

  res.status(201).send(article);
}

export async function getArticle(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);

  const article = await prismaClient.article.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, nickname: true, image: true }
      },
      _count: {
        select: { articleLikes: true }
      }
    }
  });

  if (!article) {
    throw new NotFoundError('article', id);
  }

  let isLiked = false;
  if (req.user) {
    const like = await prismaClient.articleLike.findUnique({
      where: {
        userId_articleId: {
          userId: req.user.userId,
          articleId: id,
        }
      }
    });
    isLiked = !!like;
  }

  const response: Record<string, unknown> = {
    ...article,
    likeCount: article._count.articleLikes,
    isLiked,
  };
  delete response._count;

  res.send(response);
}

export async function updateArticle(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);
  const data = create(req.body, UpdateArticleBodyStruct);

  const existingArticle = await prismaClient.article.findUnique({ where: { id } });
  if (!existingArticle) {
    throw new NotFoundError('article', id);
  }

  if (existingArticle.userId !== req.user!.userId) {
    throw new ForbiddenError('You do not have permission to update this article');
  }

  const article = await prismaClient.article.update({ where: { id }, data });

  res.send(article);
}

export async function deleteArticle(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);

  const existingArticle = await prismaClient.article.findUnique({ where: { id } });
  if (!existingArticle) {
    throw new NotFoundError('article', id);
  }

  if (existingArticle.userId !== req.user!.userId) {
    throw new ForbiddenError('You do not have permission to delete this article');
  }

  await prismaClient.article.delete({ where: { id } });

  res.status(204).send();
}

export async function getArticleList(req: Request, res: Response): Promise<void> {
  const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);

  const where = {
    title: keyword ? { contains: keyword } : undefined,
  };

  const totalCount = await prismaClient.article.count({ where });
  const articles = await prismaClient.article.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
    where,
  });

  res.send({
    list: articles,
    totalCount,
  });
}

export async function createComment(req: Request, res: Response): Promise<void> {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);

  const existingArticle = await prismaClient.article.findUnique({ where: { id: articleId } });
  if (!existingArticle) {
    throw new NotFoundError('article', articleId);
  }

  const comment = await prismaClient.comment.create({
    data: {
      articleId,
      content,
      userId: req.user!.userId
    },
  });

  res.status(201).send(comment);
}

export async function toggleArticleLike(req: Request, res: Response): Promise<void> {
  const { id: articleId } = create(req.params, IdParamsStruct);

  const existingArticle = await prismaClient.article.findUnique({ where: { id: articleId } });
  if (!existingArticle) {
    throw new NotFoundError('article', articleId);
  }

  const existingLike = await prismaClient.articleLike.findUnique({
    where: {
      userId_articleId: {
        userId: req.user!.userId,
        articleId,
      }
    }
  });

  if (existingLike) {
    await prismaClient.articleLike.delete({
      where: { id: existingLike.id }
    });
    res.status(200).send({ message: 'Like removed', isLiked: false });
  } else {
    await prismaClient.articleLike.create({
      data: {
        userId: req.user!.userId,
        articleId,
      }
    });
    res.status(200).send({ message: 'Like added', isLiked: true });
  }
}

export async function getCommentList(req: Request, res: Response): Promise<void> {
  const { id: articleId } = create(req.params, IdParamsStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const article = await prismaClient.article.findUnique({ where: { id: articleId } });
  if (!article) {
    throw new NotFoundError('article', articleId);
  }

  const commentsWithCursor = await prismaClient.comment.findMany({
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1,
    where: { articleId },
    orderBy: { createdAt: 'desc' },
  });
  const comments = commentsWithCursor.slice(0, limit);
  const cursorComment = commentsWithCursor[commentsWithCursor.length - 1];
  const nextCursor = cursorComment ? cursorComment.id : null;

  res.send({
    list: comments,
    nextCursor,
  });
}
