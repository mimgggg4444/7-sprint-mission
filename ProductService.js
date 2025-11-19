// ========================================
// Product API Service
// ========================================

const BASE_URL = 'https://panda-market-api-crud.vercel.app';

/**
 * 상품 목록 조회
 * @param {number} page - 페이지 번호
 * @param {number} pageSize - 페이지 크기
 * @param {string} keyword - 검색 키워드
 * @returns {Promise} 상품 목록
 */
export async function getProductList(page = 1, pageSize = 10, keyword = '') {
  try {
    // 쿼리 파라미터 생성
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    // keyword가 있을 경우에만 추가
    if (keyword) {
      params.append('keyword', keyword);
    }

    const url = `${BASE_URL}/products?${params.toString()}`;

    const response = await fetch(url);

    // 응답 상태 코드 확인
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ 상품 목록 조회 성공');
    return data;
  } catch (error) {
    console.error('❌ 상품 목록 조회 실패:', error.message);
    throw error;
  }
}

/**
 * 상품 상세 조회
 * @param {number} productId - 상품 ID
 * @returns {Promise} 상품 상세 정보
 */
export async function getProduct(productId) {
  try {
    const url = `${BASE_URL}/products/${productId}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ 상품 조회 성공 (ID: ${productId})`);
    return data;
  } catch (error) {
    console.error(`❌ 상품 조회 실패 (ID: ${productId}):`, error.message);
    throw error;
  }
}

/**
 * 상품 생성
 * @param {Object} productData - 상품 데이터
 * @param {string} productData.name - 상품명
 * @param {string} productData.description - 상품 설명
 * @param {number} productData.price - 판매 가격
 * @param {Array} productData.tags - 해시태그 배열
 * @param {Array} productData.images - 이미지 배열
 * @returns {Promise} 생성된 상품 정보
 */
export async function createProduct(productData) {
  try {
    const url = `${BASE_URL}/products`;

    const requestBody = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      tags: productData.tags || [],
      images: productData.images || [],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ 상품 생성 성공');
    return data;
  } catch (error) {
    console.error('❌ 상품 생성 실패:', error.message);
    throw error;
  }
}

/**
 * 상품 수정
 * @param {number} productId - 상품 ID
 * @param {Object} productData - 수정할 상품 데이터
 * @returns {Promise} 수정된 상품 정보
 */
export async function patchProduct(productId, productData) {
  try {
    const url = `${BASE_URL}/products/${productId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ 상품 수정 성공 (ID: ${productId})`);
    return data;
  } catch (error) {
    console.error(`❌ 상품 수정 실패 (ID: ${productId}):`, error.message);
    throw error;
  }
}

/**
 * 상품 삭제
 * @param {number} productId - 상품 ID
 * @returns {Promise} 삭제 결과
 */
export async function deleteProduct(productId) {
  try {
    const url = `${BASE_URL}/products/${productId}`;

    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    // DELETE는 응답 body가 없을 수 있음
    const data = response.status === 204 ? null : await response.json();
    console.log(`✅ 상품 삭제 성공 (ID: ${productId})`);
    return { success: true, productId };
  } catch (error) {
    console.error(`❌ 상품 삭제 실패 (ID: ${productId}):`, error.message);
    throw error;
  }
}