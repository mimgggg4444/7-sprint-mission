// ========================================
// Product API Service
// ========================================

const BASE_URL = 'https://panda-market-api-crud.vercel.app';

/**
 * 쿼리 스트링 생성 유틸
 */
function buildQuery({ page, pageSize, keyword }) {
  const params = new URLSearchParams();

  if (page != null) params.set('page', String(page));
  if (pageSize != null) params.set('pageSize', String(pageSize));
  if (keyword) params.set('keyword', keyword);

  return params.toString();
}

/**
 * 2xx 응답 검증
 */
function validateResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
}

/**
 * 공통 로깅
 */
function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(context, error) {
  console.error(`❌ ${context}: ${error.message}`);
}

/**
 * 상품 목록 조회 (GET)
 */
export async function getProductList(page = 1, pageSize = 10, keyword = '') {
  const query = buildQuery({ page, pageSize, keyword });
  const url = `${BASE_URL}/products?${query}`;

  try {
    const response = await fetch(url);
    validateResponse(response);

    const data = await response.json();
    logSuccess('상품 목록 조회 성공');
    return data;
  } catch (error) {
    logError('상품 목록 조회 실패', error);
    throw error;
  }
}

/**
 * 상품 상세 조회 (GET)
 */
export async function getProduct(productId) {
  const url = `${BASE_URL}/products/${productId}`;

  try {
    const response = await fetch(url);
    validateResponse(response);

    const data = await response.json();
    logSuccess(`상품 조회 성공 (ID: ${productId})`);
    return data;
  } catch (error) {
    logError(`상품 조회 실패 (ID: ${productId})`, error);
    throw error;
  }
}

/**
 * 상품 생성 (POST)
 */
export async function createProduct(productData) {
  const url = `${BASE_URL}/products`;

  const body = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    tags: productData.tags || [],
    images: productData.images || [],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    validateResponse(response);

    const data = await response.json();
    logSuccess('상품 생성 성공');
    return data;
  } catch (error) {
    logError('상품 생성 실패', error);
    throw error;
  }
}

/**
 * 상품 수정 (PATCH)
 */
export async function patchProduct(productId, productData) {
  const url = `${BASE_URL}/products/${productId}`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    validateResponse(response);

    const data = await response.json();
    logSuccess(`상품 수정 성공 (ID: ${productId})`);
    return data;
  } catch (error) {
    logError(`상품 수정 실패 (ID: ${productId})`, error);
    throw error;
  }
}

/**
 * 상품 삭제 (DELETE)
 */
export async function deleteProduct(productId) {
  const url = `${BASE_URL}/products/${productId}`;

  try {
    const response = await fetch(url, { method: 'DELETE' });
    validateResponse(response);

    // DELETE는 body가 없을 수 있음
    response.status === 204 ? null : await response.json();

    logSuccess(`상품 삭제 성공 (ID: ${productId})`);
    return { success: true, productId };
  } catch (error) {
    logError(`상품 삭제 실패 (ID: ${productId})`, error);
    throw error;
  }
}
