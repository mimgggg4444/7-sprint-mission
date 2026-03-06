import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import * as productsRepository from '../../repositories/productsRepository';
import * as favoritesRepository from '../../repositories/favoritesRepository';
import * as commentsRepository from '../../repositories/commentsRepository';
import * as usersRepository from '../../repositories/usersRepository';
import * as notificationsService from '../../services/notificationsService';

jest.mock('../../repositories/productsRepository');
jest.mock('../../repositories/favoritesRepository');
jest.mock('../../repositories/commentsRepository');
jest.mock('../../repositories/usersRepository');
jest.mock('../../services/notificationsService');

const mockProductsRepo = productsRepository as jest.Mocked<typeof productsRepository>;
const mockFavoritesRepo = favoritesRepository as jest.Mocked<typeof favoritesRepository>;
const mockCommentsRepo = commentsRepository as jest.Mocked<typeof commentsRepository>;
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

const mockProductBase = {
  id: 1,
  name: 'Test Product',
  description: 'A test product',
  price: 10000,
  tags: ['tag1', 'tag2'],
  images: ['image1.png'],
  userId: TEST_USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProductWithMeta = {
  ...mockProductBase,
  favorites: undefined,
  favoriteCount: 0,
  isFavorited: false,
};

const mockComment = {
  id: 1,
  content: 'Test comment',
  userId: TEST_USER_ID,
  productId: 1,
  articleId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFavorite = {
  id: 1,
  userId: TEST_USER_ID,
  productId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUsersRepo.getUser.mockResolvedValue(mockUser);
});

// ─── 인증 불필요 API ───────────────────────────────────────────────────────────

describe('[인증 불필요] GET /products', () => {
  it('상품 목록을 200으로 반환한다', async () => {
    mockProductsRepo.getProductListWithFavorites.mockResolvedValue({
      list: [mockProductWithMeta] as any,
      totalCount: 1,
    });

    const res = await request(app).get('/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('list');
    expect(res.body).toHaveProperty('totalCount', 1);
    expect(res.body.list).toHaveLength(1);
  });

  it('keyword 쿼리로 검색할 수 있다', async () => {
    mockProductsRepo.getProductListWithFavorites.mockResolvedValue({
      list: [],
      totalCount: 0,
    });

    const res = await request(app).get('/products?keyword=notexist');

    expect(res.status).toBe(200);
    expect(res.body.list).toHaveLength(0);
  });

  it('page, pageSize 쿼리를 지원한다', async () => {
    mockProductsRepo.getProductListWithFavorites.mockResolvedValue({
      list: [mockProductWithMeta] as any,
      totalCount: 10,
    });

    const res = await request(app).get('/products?page=1&pageSize=5');

    expect(res.status).toBe(200);
  });
});

describe('[인증 불필요] GET /products/:id', () => {
  it('존재하는 상품을 200으로 반환한다', async () => {
    mockProductsRepo.getProductWithFavorites.mockResolvedValue(mockProductWithMeta as any);

    const res = await request(app).get('/products/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('name', 'Test Product');
  });

  it('존재하지 않는 상품 조회 시 404를 반환한다', async () => {
    mockProductsRepo.getProductWithFavorites.mockResolvedValue(null);

    const res = await request(app).get('/products/9999');

    expect(res.status).toBe(404);
  });
});

describe('[인증 불필요] GET /products/:id/comments', () => {
  it('상품의 댓글 목록을 200으로 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(mockProductBase as any);
    mockCommentsRepo.getCommentList.mockResolvedValue({
      list: [mockComment],
      nextCursor: null,
    });

    const res = await request(app).get('/products/1/comments');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('list');
  });

  it('존재하지 않는 상품의 댓글 조회 시 404를 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(null);

    const res = await request(app).get('/products/9999/comments');

    expect(res.status).toBe(404);
  });
});

// ─── 인증 필요 API ────────────────────────────────────────────────────────────

describe('[인증 필요] POST /products', () => {
  it('인증된 사용자가 상품을 생성하면 201을 반환한다', async () => {
    mockProductsRepo.createProduct.mockResolvedValue(mockProductBase as any);

    const res = await request(app)
      .post('/products')
      .set('Cookie', getAuthCookie())
      .send({
        name: 'New Product',
        description: 'A new product',
        price: 5000,
        tags: ['new'],
        images: ['img.png'],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name');
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).post('/products').send({
      name: 'New Product',
      description: 'A new product',
      price: 5000,
      tags: [],
      images: [],
    });

    expect(res.status).toBe(401);
  });

  it('필수 필드 누락 시 400을 반환한다', async () => {
    const res = await request(app)
      .post('/products')
      .set('Cookie', getAuthCookie())
      .send({ name: 'Only Name' });

    expect(res.status).toBe(400);
  });
});

describe('[인증 필요] PATCH /products/:id', () => {
  it('소유자가 상품을 수정하면 200을 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(mockProductBase as any);
    mockProductsRepo.updateProductWithFavorites.mockResolvedValue({
      ...mockProductWithMeta,
      name: 'Updated Product',
    } as any);
    mockFavoritesRepo.getFavoritesByProductId.mockResolvedValue([]);

    const res = await request(app)
      .patch('/products/1')
      .set('Cookie', getAuthCookie())
      .send({ name: 'Updated Product' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Product');
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).patch('/products/1').send({ name: 'Updated' });

    expect(res.status).toBe(401);
  });

  it('소유자가 아닌 사용자가 수정 시 403을 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue({
      ...mockProductBase,
      userId: OTHER_USER_ID,
    } as any);

    const res = await request(app)
      .patch('/products/1')
      .set('Cookie', getAuthCookie(TEST_USER_ID))
      .send({ name: 'Updated' });

    expect(res.status).toBe(403);
  });

  it('존재하지 않는 상품 수정 시 404를 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(null);

    const res = await request(app)
      .patch('/products/9999')
      .set('Cookie', getAuthCookie())
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('[인증 필요] DELETE /products/:id', () => {
  it('소유자가 상품을 삭제하면 204를 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(mockProductBase as any);
    mockProductsRepo.deleteProduct.mockResolvedValue(mockProductBase as any);

    const res = await request(app)
      .delete('/products/1')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(204);
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).delete('/products/1');

    expect(res.status).toBe(401);
  });

  it('소유자가 아닌 사용자가 삭제 시 403을 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue({
      ...mockProductBase,
      userId: OTHER_USER_ID,
    } as any);

    const res = await request(app)
      .delete('/products/1')
      .set('Cookie', getAuthCookie(TEST_USER_ID));

    expect(res.status).toBe(403);
  });

  it('존재하지 않는 상품 삭제 시 404를 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(null);

    const res = await request(app)
      .delete('/products/9999')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(404);
  });
});

describe('[인증 필요] POST /products/:id/comments', () => {
  it('인증된 사용자가 댓글을 생성하면 201을 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(mockProductBase as any);
    mockCommentsRepo.createComment.mockResolvedValue({ ...mockComment });

    const res = await request(app)
      .post('/products/1/comments')
      .set('Cookie', getAuthCookie())
      .send({ content: 'Test comment', productId: 1 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('content', 'Test comment');
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app)
      .post('/products/1/comments')
      .send({ content: 'Test' });

    expect(res.status).toBe(401);
  });
});

describe('[인증 필요] POST /products/:id/favorites', () => {
  it('인증된 사용자가 즐겨찾기를 추가하면 201을 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(mockProductBase as any);
    mockFavoritesRepo.getFavorite.mockResolvedValue(null);
    mockFavoritesRepo.createFavorite.mockResolvedValue(mockFavorite);

    const res = await request(app)
      .post('/products/1/favorites')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(201);
  });

  it('이미 즐겨찾기한 경우 400을 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(mockProductBase as any);
    mockFavoritesRepo.getFavorite.mockResolvedValue(mockFavorite);

    const res = await request(app)
      .post('/products/1/favorites')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(400);
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).post('/products/1/favorites');

    expect(res.status).toBe(401);
  });
});

describe('[인증 필요] DELETE /products/:id/favorites', () => {
  it('인증된 사용자가 즐겨찾기를 삭제하면 204를 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(mockProductBase as any);
    mockFavoritesRepo.getFavorite.mockResolvedValue(mockFavorite);
    mockFavoritesRepo.deleteFavorite.mockResolvedValue(undefined as any);

    const res = await request(app)
      .delete('/products/1/favorites')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(204);
  });

  it('즐겨찾기하지 않은 상품 삭제 시 400을 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(mockProductBase as any);
    mockFavoritesRepo.getFavorite.mockResolvedValue(null);

    const res = await request(app)
      .delete('/products/1/favorites')
      .set('Cookie', getAuthCookie());

    expect(res.status).toBe(400);
  });

  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).delete('/products/1/favorites');

    expect(res.status).toBe(401);
  });
});
