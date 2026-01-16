import { articleRepository, ArticleListParams } from '../repositories/articleRepository.js';
import { commentRepository } from '../repositories/commentRepository.js';
import { likeRepository } from '../repositories/likeRepository.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import ForbiddenError from '../lib/errors/ForbiddenError.js';

export interface CreateArticleData {
  title: string;
  content: string;
  image: string | null;
  userId: number;
}

export interface UpdateArticleData {
  title?: string;
  content?: string;
  image?: string | null;
}

export const articleService = {
  async createArticle(data: CreateArticleData) {
    return articleRepository.create({
      title: data.title,
      content: data.content,
      image: data.image,
      user: { connect: { id: data.userId } },
    });
  },

  async getArticle(id: number, userId?: number) {
    const article = await articleRepository.findById(id);
    if (!article) {
      throw new NotFoundError('article', id);
    }

    let isLiked = false;
    if (userId) {
      const like = await likeRepository.findArticleLike(userId, id);
      isLiked = !!like;
    }

    const { _count, ...articleData } = article;
    return {
      ...articleData,
      likeCount: _count.articleLikes,
      isLiked,
    };
  },

  async updateArticle(id: number, userId: number, data: UpdateArticleData) {
    const existingArticle = await articleRepository.findByIdSimple(id);
    if (!existingArticle) {
      throw new NotFoundError('article', id);
    }

    if (existingArticle.userId !== userId) {
      throw new ForbiddenError('You do not have permission to update this article');
    }

    return articleRepository.update(id, data);
  },

  async deleteArticle(id: number, userId: number) {
    const existingArticle = await articleRepository.findByIdSimple(id);
    if (!existingArticle) {
      throw new NotFoundError('article', id);
    }

    if (existingArticle.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this article');
    }

    await articleRepository.delete(id);
  },

  async getArticleList(params: ArticleListParams) {
    return articleRepository.findMany(params);
  },

  async createComment(articleId: number, userId: number, content: string) {
    const existingArticle = await articleRepository.findByIdSimple(articleId);
    if (!existingArticle) {
      throw new NotFoundError('article', articleId);
    }

    return commentRepository.create({
      content,
      user: { connect: { id: userId } },
      article: { connect: { id: articleId } },
    });
  },

  async getCommentList(articleId: number, cursor: number, limit: number) {
    const existingArticle = await articleRepository.findByIdSimple(articleId);
    if (!existingArticle) {
      throw new NotFoundError('article', articleId);
    }

    return commentRepository.findMany({ cursor, limit, articleId });
  },

  async toggleLike(articleId: number, userId: number) {
    const existingArticle = await articleRepository.findByIdSimple(articleId);
    if (!existingArticle) {
      throw new NotFoundError('article', articleId);
    }

    const existingLike = await likeRepository.findArticleLike(userId, articleId);

    if (existingLike) {
      await likeRepository.deleteArticleLike(existingLike.id);
      return { message: 'Like removed', isLiked: false };
    } else {
      await likeRepository.createArticleLike(userId, articleId);
      return { message: 'Like added', isLiked: true };
    }
  },
};
