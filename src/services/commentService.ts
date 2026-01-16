import { commentRepository } from '../repositories/commentRepository.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import ForbiddenError from '../lib/errors/ForbiddenError.js';

export const commentService = {
  async updateComment(id: number, userId: number, content: string) {
    const existingComment = await commentRepository.findById(id);
    if (!existingComment) {
      throw new NotFoundError('comment', id);
    }

    if (existingComment.userId !== userId) {
      throw new ForbiddenError('You do not have permission to update this comment');
    }

    return commentRepository.update(id, { content });
  },

  async deleteComment(id: number, userId: number) {
    const existingComment = await commentRepository.findById(id);
    if (!existingComment) {
      throw new NotFoundError('comment', id);
    }

    if (existingComment.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this comment');
    }

    await commentRepository.delete(id);
  },
};
