import { Request, Response } from 'express';
import { create } from 'superstruct';
import { commentService } from '../services/commentService.js';
import { UpdateCommentBodyStruct } from '../structs/commentsStruct.js';
import { IdParamsStruct } from '../structs/commonStructs.js';

export async function updateComment(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);
  const { content } = create(req.body, UpdateCommentBodyStruct);

  const updatedComment = await commentService.updateComment(id, req.user!.userId, content!);
  res.send(updatedComment);
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  const { id } = create(req.params, IdParamsStruct);

  await commentService.deleteComment(id, req.user!.userId);
  res.status(204).send();
}
