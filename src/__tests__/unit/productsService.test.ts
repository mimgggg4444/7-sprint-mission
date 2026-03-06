import * as productsService from '../../services/productsService';
import * as productsRepository from '../../repositories/productsRepository';
import * as favoritesRepository from '../../repositories/favoritesRepository';
import * as notificationsService from '../../services/notificationsService';
import NotFoundError from '../../lib/errors/NotFoundError';
import ForbiddenError from '../../lib/errors/ForbiddenError';
import { NotificationType } from '../../types/Notification';

jest.mock('../../repositories/productsRepository');
jest.mock('../../repositories/favoritesRepository');
jest.mock('../../services/notificationsService');

const mockProductsRepo = productsRepository as jest.Mocked<typeof productsRepository>;
const mockFavoritesRepo = favoritesRepository as jest.Mocked<typeof favoritesRepository>;

const TEST_USER_ID = 1;
const OTHER_USER_ID = 2;

const baseProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Description',
  price: 10000,
  tags: ['tag1'],
  images: ['img.png'],
  userId: TEST_USER_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const productWithMeta = {
  ...baseProduct,
  favorites: undefined as any,
  favoriteCount: 2,
  isFavorited: false,
};

const mockFavorite = {
  id: 1,
  userId: 10,
  productId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── createProduct ────────────────────────────────────────────────────────────

describe('createProduct', () => {
  it('상품을 생성하고 favoriteCount=0, isFavorited=false로 반환한다', async () => {
    mockProductsRepo.createProduct.mockResolvedValue(baseProduct as any);

    const result = await productsService.createProduct({
      name: 'New Product',
      description: 'Desc',
      price: 5000,
      tags: [],
      images: [],
      userId: TEST_USER_ID,
    });

    expect(mockProductsRepo.createProduct).toHaveBeenCalledTimes(1);
    expect(result.favoriteCount).toBe(0);
    expect(result.isFavorited).toBe(false);
  });

  it('createProduct 레포지토리 함수를 올바른 인자로 호출한다', async () => {
    const data = {
      name: 'Product',
      description: 'Desc',
      price: 1000,
      tags: ['a'],
      images: ['b.png'],
      userId: TEST_USER_ID,
    };
    mockProductsRepo.createProduct.mockResolvedValue(baseProduct as any);

    await productsService.createProduct(data);

    expect(mockProductsRepo.createProduct).toHaveBeenCalledWith(data);
  });
});

// ─── getProduct ───────────────────────────────────────────────────────────────

describe('getProduct', () => {
  it('상품이 존재하면 상품을 반환한다', async () => {
    mockProductsRepo.getProductWithFavorites.mockResolvedValue(productWithMeta as any);

    const result = await productsService.getProduct(1);

    expect(result).toEqual(expect.objectContaining({ id: 1, name: 'Test Product' }));
  });

  it('상품이 없으면 NotFoundError를 던진다', async () => {
    mockProductsRepo.getProductWithFavorites.mockResolvedValue(null);

    await expect(productsService.getProduct(9999)).rejects.toThrow(NotFoundError);
  });

  it('getProductWithFavorites를 올바른 id로 호출한다', async () => {
    mockProductsRepo.getProductWithFavorites.mockResolvedValue(productWithMeta as any);

    await productsService.getProduct(42);

    expect(mockProductsRepo.getProductWithFavorites).toHaveBeenCalledWith(42);
  });
});

// ─── getProductList ───────────────────────────────────────────────────────────

describe('getProductList', () => {
  it('상품 목록과 totalCount를 반환한다', async () => {
    const params = { page: 1, pageSize: 10, orderBy: 'recent' as const, keyword: '' };
    mockProductsRepo.getProductListWithFavorites.mockResolvedValue({
      list: [productWithMeta] as any,
      totalCount: 1,
    });

    const result = await productsService.getProductList(params);

    expect(result.list).toHaveLength(1);
    expect(result.totalCount).toBe(1);
  });

  it('userId 옵션을 getProductListWithFavorites에 전달한다', async () => {
    const params = { page: 1, pageSize: 10, orderBy: 'recent' as const, keyword: '' };
    mockProductsRepo.getProductListWithFavorites.mockResolvedValue({
      list: [],
      totalCount: 0,
    });

    await productsService.getProductList(params, { userId: TEST_USER_ID });

    expect(mockProductsRepo.getProductListWithFavorites).toHaveBeenCalledWith(params, {
      userId: TEST_USER_ID,
    });
  });
});

// ─── updateProduct ────────────────────────────────────────────────────────────

describe('updateProduct', () => {
  it('소유자가 상품을 수정하면 수정된 상품을 반환한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(baseProduct as any);
    mockProductsRepo.updateProductWithFavorites.mockResolvedValue({
      ...productWithMeta,
      name: 'Updated',
    } as any);
    mockFavoritesRepo.getFavoritesByProductId.mockResolvedValue([]);

    const result = await productsService.updateProduct(1, {
      name: 'Updated',
      userId: TEST_USER_ID,
    });

    expect(result.name).toBe('Updated');
  });

  it('상품이 없으면 NotFoundError를 던진다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(null);

    await expect(
      productsService.updateProduct(9999, { name: 'Updated', userId: TEST_USER_ID }),
    ).rejects.toThrow(NotFoundError);
  });

  it('소유자가 아닌 경우 ForbiddenError를 던진다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue({ ...baseProduct, userId: OTHER_USER_ID } as any);

    await expect(
      productsService.updateProduct(1, { name: 'Updated', userId: TEST_USER_ID }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('가격이 변경되면 즐겨찾기한 사용자들에게 알림을 보낸다', async () => {
    const spy = jest.spyOn(notificationsService, 'createNotifications');
    mockProductsRepo.getProduct.mockResolvedValue({ ...baseProduct, price: 10000 } as any);
    mockProductsRepo.updateProductWithFavorites.mockResolvedValue({
      ...productWithMeta,
      price: 8000,
    } as any);
    mockFavoritesRepo.getFavoritesByProductId.mockResolvedValue([
      { ...mockFavorite, id: 1, userId: 10 },
      { ...mockFavorite, id: 2, userId: 11 },
    ]);

    await productsService.updateProduct(1, { price: 8000, userId: TEST_USER_ID });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          userId: 10,
          type: NotificationType.PRICE_CHANGED,
        }),
        expect.objectContaining({
          userId: 11,
          type: NotificationType.PRICE_CHANGED,
        }),
      ]),
    );
  });

  it('가격이 변경되지 않으면 알림을 보내지 않는다', async () => {
    const spy = jest.spyOn(notificationsService, 'createNotifications');
    mockProductsRepo.getProduct.mockResolvedValue({ ...baseProduct, price: 10000 } as any);
    mockProductsRepo.updateProductWithFavorites.mockResolvedValue({
      ...productWithMeta,
      price: 10000,
    } as any);
    mockFavoritesRepo.getFavoritesByProductId.mockResolvedValue([]);

    await productsService.updateProduct(1, { name: 'New Name', userId: TEST_USER_ID });

    expect(spy).not.toHaveBeenCalled();
  });
});

// ─── deleteProduct ────────────────────────────────────────────────────────────

describe('deleteProduct', () => {
  it('소유자가 상품을 삭제하면 deleteProduct 레포지토리를 호출한다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(baseProduct as any);
    mockProductsRepo.deleteProduct.mockResolvedValue(baseProduct as any);

    await productsService.deleteProduct(1, TEST_USER_ID);

    expect(mockProductsRepo.deleteProduct).toHaveBeenCalledWith(1);
  });

  it('상품이 없으면 NotFoundError를 던진다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue(null);

    await expect(productsService.deleteProduct(9999, TEST_USER_ID)).rejects.toThrow(NotFoundError);
  });

  it('소유자가 아닌 경우 ForbiddenError를 던진다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue({ ...baseProduct, userId: OTHER_USER_ID } as any);

    await expect(productsService.deleteProduct(1, TEST_USER_ID)).rejects.toThrow(ForbiddenError);
  });

  it('소유자가 아닌 경우 deleteProduct 레포지토리를 호출하지 않는다', async () => {
    mockProductsRepo.getProduct.mockResolvedValue({ ...baseProduct, userId: OTHER_USER_ID } as any);

    try {
      await productsService.deleteProduct(1, TEST_USER_ID);
    } catch {
      // expected
    }

    expect(mockProductsRepo.deleteProduct).not.toHaveBeenCalled();
  });
});
