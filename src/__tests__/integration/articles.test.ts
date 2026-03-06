import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import * as articlesRepository from '../../repositories/articlesRepository';
import * as commentsRepository from '../../repositories/commentsRepository';
import * as likesRepository from '../../repositories/likesRepository';
import * as usersRepository from '../../repositories/usersRepository';
jest.mock('../../repositories/articlesRepository');
jest.mock('../../repositories/commentsRepository');
jest.mock('../../repositories/likesRepository');
jest.mock('../../repositories/usersRepository');
jest.mock('../../services/notificationsService');

const mockArticlesRepo = articlesRepository as jest.Mocked<typeof articlesRepository>;
const mockCommentsRepo = commentsRepository as jest.Mocked<typeof commentsRepository>;
const mockLikesRepo = likesRepository as jest.Mocked<typeof likesRepository>;
const mockUsersRepo = usersRepository as jest.Mocked<typeof usersRepository>;

const TEST_USER_ID = 1;
const OTHER_USER_ID = 2;

function getAuthCookie(userId = TEST_USER_ID): string {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    { expiresIn: '1h' },
  );
  return `access-token=${token}`;
}

const mockUser = {
  id: TEST_USER_ID,
  email: 'test@example.com',
  nickname: 'testuser',
  password: 'hashedpw',
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockArticleBase = {
  id: 1,
  title: 'Test Article',
  content: 'Test content',
  image: null,
  userId: TEST_USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockArticleWithMeta = {
  ...mockArticleBase,
  likes: undefined as any,
  likeCount: 0,
  isLiked: false,
};

const mockComment = {
  id: 1,
  content: 'Test comment',
  userId: TEST_USER_ID,
  articleId: 1,
  productId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockLike = {
  id: 1,
  userId: TEST_USER_ID,
  articleId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUsersRepo.getUser.mockResolvedValue(mockUser);
});

// ─── 인증 불필요 API ───────────────────────────────────────────────────────────

describe('[인증 불필요] GET /articles', () => {
  it('게시글 목록을 200으로 반환한다', async () => {
    mockArticlesRepo.getArticleListWithLikes.mockResolvedValue({
      list: [mockArticleWithMeta] as any,
      totalCount: 1,
    });

    const res = await request(app).get('/articles');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('list');
    expect(res.body).toHaveProperty('totalCount', 1);
    expect(res.body.list).toHaveLength(1);
  });

  it('keyword로 검색할 수 있다', async () => {
    mockArticlesRepo.getArticleListWithLikes.mockResolvedValue({
      list: [],
      totalCount: 0,
    });

    const res = await request(app).get('/articles?keyword=notexist');

    expect(res.status).toBe(200);
    expect(res.body.list).toHaveLength(0);
  });

  it('page, pageSize 쿼리를 지원한다', async () => {
    mockArticlesRepo.getArticleListWithLikes.mockResolvedValue({
      list: [mockArticleWithMeta] as any,
      totalCount: 10,
    });

    const res = await request(app).get('/articles?page=1&pageSize=5');

    expect(res.status).toBe(200);
  });
});

describe('[인증 불필요] GET /articles/:id', () => {
  it('존재하는 게시글을 200으로 반환한다', async () => {
    mockArticlesRepo.getArticleWithLkes.mockResolvedValue(mockArticleWithMeta as any);

    const res = await request(app).get('/articles/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('title', 'Test Article');
  });

  it('존재하지 않는 게시글 조회 시 404를 반환한다', async () => {
    mockArticlesRepo.getArticleWithLkes.mockResolvedValue(null);

    const res = await request(app).get('/articles/9999');

    expect(res.status).toBe(404);
  });
});

describe('[인증 불필요] GET /articles/:id/comments', () => {
  it('게시글의 댓글 목록을 200으로 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue(mockArticleBase as any);
    mockCommentsRepo.getCommentList.mockResolvedValue({
      list: [mockComment],
      nextCursor: null,
    });

    const res = await request(app).get('/articles/1/comments');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('list');
  });

  it('존재하지 않는 게시글의 댓글 조회 시 404를 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue(null);

    const res = await request(app).get('/articles/9999/comments');

    expect(res.status).toBe(404);
  });
});

// ─── 인증 필요 API ────────────────────────────────────────────────────────────

describe('[인증 필요] POST /articles', () => {
  it('인증된 사용자가 게시글을 생성하면 201을 반환한다', async () => {
    mockArticlesRepo.createArticle.mockResolvedValue(mockArticleBase as any);

    const res = await request(app)
      .post('/articles')
      .set('Cookie', getAuthCookie())
      .send({
        title: 'New Article',
        content: 'New content',
        image: null,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('title');
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).post('/articles').send({
      title: 'New Article',
      content: 'New content',
      image: null,
    });

    expect(res.status).toBe(401);
  });

  it('필수 필드 누락 시 400을 반환한다', async () => {
    const res = await request(app)
      .post('/articles')
      .set('Cookie', getAuthCookie())
      .send({ title: '' });

    expect(res.status).toBe(400);
  });
});

describe('[인증 필요] PATCH /articles/:id', () => {
  it('소유자가 게시글을 수정하면 200을 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue(mockArticleBase as any);
    mockArticlesRepo.updateArticleWithLikes.mockResolvedValue({
      ...mockArticleWithMeta,
      title: 'Updated Article',
    } as any);

    const res = await request(app)
      .patch('/articles/1')
      .set('Cookie', getAuthCookie())
      .send({ title: 'Updated Article' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Updated Article');
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).patch('/articles/1').send({ title: 'Updated' });

    expect(res.status).toBe(401);
  });

  it('소유자가 아닌 사용자가 수정 시 403을 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue({
      ...mockArticleBase,
      userId: OTHER_USER_ID,
    } as any);

    const res = await request(app)
      .patch('/articles/1')
      .set('Cookie', getAuthCookie(TEST_USER_ID))
      .send({ title: 'Updated' });

    expect(res.status).toBe(403);
  });

  it('존재하지 않는 게시글 수정 시 404를 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue(null);

    const res = await request(app)
      .patch('/articles/9999')
      .set('Cookie', getAuthCookie())
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('[인증 필요] DELETE /articles/:id', () => {
  it('소유자가 게시글을 삭제하면 204를 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue(mockArticleBase as any);
    mockArticlesRepo.deleteArticle.mockResolvedValue(mockArticleBase as any);

    const res = await request(app)
      .delete('/articles/1')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(204);
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).delete('/articles/1');

    expect(res.status).toBe(401);
  });

  it('소유자가 아닌 사용자가 삭제 시 403을 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue({
      ...mockArticleBase,
      userId: OTHER_USER_ID,
    } as any);

    const res = await request(app)
      .delete('/articles/1')
      .set('Cookie', getAuthCookie(TEST_USER_ID));

    expect(res.status).toBe(403);
  });

  it('존재하지 않는 게시글 삭제 시 404를 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue(null);

    const res = await request(app)
      .delete('/articles/9999')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(404);
  });
});

describe('[인증 필요] POST /articles/:id/comments', () => {
  it('인증된 사용자가 댓글을 생성하면 201을 반환한다', async () => {
    mockArticlesRepo.getArticle
      .mockResolvedValueOnce(mockArticleBase as any)
      .mockResolvedValueOnce(mockArticleBase as any);
    mockCommentsRepo.createComment.mockResolvedValue({ ...mockComment });

    const res = await request(app)
      .post('/articles/1/comments')
      .set('Cookie', getAuthCookie())
      .send({ content: 'New comment' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('content');
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app)
      .post('/articles/1/comments')
      .send({ content: 'Test' });

    expect(res.status).toBe(401);
  });
});

describe('[인증 필요] POST /articles/:id/likes', () => {
  it('인증된 사용자가 좋아요를 추가하면 201을 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue(mockArticleBase as any);
    mockLikesRepo.getLike.mockResolvedValue(null);
    mockLikesRepo.createLike.mockResolvedValue(mockLike as any);

    const res = await request(app)
      .post('/articles/1/likes')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(201);
  });

  it('이미 좋아요한 경우 400을 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue(mockArticleBase as any);
    mockLikesRepo.getLike.mockResolvedValue(mockLike as any);

    const res = await request(app)
      .post('/articles/1/likes')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(400);
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).post('/articles/1/likes');

    expect(res.status).toBe(401);
  });
});

describe('[인증 필요] DELETE /articles/:id/likes', () => {
  it('인증된 사용자가 좋아요를 삭제하면 204를 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue(mockArticleBase as any);
    mockLikesRepo.getLike.mockResolvedValue(mockLike as any);
    mockLikesRepo.deleteLike.mockResolvedValue(mockLike as any);

    const res = await request(app)
      .delete('/articles/1/likes')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(204);
  });

  it('좋아요하지 않은 게시글 삭제 시 400을 반환한다', async () => {
    mockArticlesRepo.getArticle.mockResolvedValue(mockArticleBase as any);
    mockLikesRepo.getLike.mockResolvedValue(null);

    const res = await request(app)
      .delete('/articles/1/likes')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(400);
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).delete('/articles/1/likes');

    expect(res.status).toBe(401);
  });
});
