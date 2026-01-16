import { Request, Response } from 'express';
import { create } from 'superstruct';
import { prismaClient } from '../lib/prismaClient.js';
import { UpdateCommentBodyStruct } from '../structs/commentsStruct.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import ForbiddenError from '../lib/errors/ForbiddenError.js';
import { IdParamsStruct } from '../structs/commonStructs.js';

export async function updateComment(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, UpdateCommentBodyStruct);

  const existingComment = await prismaClient.comment.findUnique({ where: { id } });
  if (!existingComment) {
    throw new NotFoundError('comment', id);
  }

  if (existingComment.userId !== req.user!.userId) {
    throw new ForbiddenError('You do not have permission to update this comment');
  }

  const updatedComment = await prismaClient.comment.update({
    where: { id },
    data: { content },
  });

  res.send(updatedComment);
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);

  const existingComment = await prismaClient.comment.findUnique({ where: { id } });
  if (!existingComment) {
    throw new NotFoundError('comment', id);
  }

  if (existingComment.userId !== req.user!.userId) {
    throw new ForbiddenError('You do not have permission to delete this comment');
  }

  await prismaClient.comment.delete({ where: { id } });

  res.status(204).send();
}
