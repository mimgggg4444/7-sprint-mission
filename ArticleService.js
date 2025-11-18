// ========================================
// Article API Service
// ========================================

const BASE_URL = 'https://panda-market-api-crud.vercel.app';

/**
 * 게시글 목록 조회
 * @param {number} page - 페이지 번호
 * @param {number} pageSize - 페이지 크기
 * @param {string} keyword - 검색 키워드
 * @returns {Promise} 게시글 목록
 */
export function getArticleList(page = 1, pageSize = 10, keyword = '') {
  // 쿼리 파라미터 생성
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  // keyword가 있을 경우에만 추가
  if (keyword) {
    params.append('keyword', keyword);
  }

  const url = `${BASE_URL}/articles?${params.toString()}`;

  return fetch(url)
    .then((response) => {
      // 응답 상태 코드 확인
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('✅ 게시글 목록 조회 성공');
      return data;
    })
    .catch((error) => {
      console.error('❌ 게시글 목록 조회 실패:', error.message);
      throw error;
    });
}

/**
 * 게시글 상세 조회
 * @param {number} articleId - 게시글 ID
 * @returns {Promise} 게시글 상세 정보
 */
export function getArticle(articleId) {
  const url = `${BASE_URL}/articles/${articleId}`;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(`✅ 게시글 조회 성공 (ID: ${articleId})`);
      return data;
    })
    .catch((error) => {
      console.error(`❌ 게시글 조회 실패 (ID: ${articleId}):`, error.message);
      throw error;
    });
}

/**
 * 게시글 생성
 * @param {Object} articleData - 게시글 데이터
 * @param {string} articleData.title - 제목
 * @param {string} articleData.content - 내용
 * @param {string} articleData.image - 이미지 URL (API 버그로 writer 대신 사용)
 * @returns {Promise} 생성된 게시글 정보
 */
export function createArticle(articleData) {
  const url = `${BASE_URL}/articles`;

  const requestBody = {
    title: articleData.title,
    content: articleData.content,
    image: articleData.image || '', // writer 대신 image 사용
  };

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('✅ 게시글 생성 성공');
      return data;
    })
    .catch((error) => {
      console.error('❌ 게시글 생성 실패:', error.message);
      throw error;
    });
}

/**
 * 게시글 수정
 * @param {number} articleId - 게시글 ID
 * @param {Object} articleData - 수정할 게시글 데이터
 * @returns {Promise} 수정된 게시글 정보
 */
export function patchArticle(articleId, articleData) {
  const url = `${BASE_URL}/articles/${articleId}`;

  return fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(articleData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(`✅ 게시글 수정 성공 (ID: ${articleId})`);
      return data;
    })
    .catch((error) => {
      console.error(`❌ 게시글 수정 실패 (ID: ${articleId}):`, error.message);
      throw error;
    });
}

/**
 * 게시글 삭제
 * @param {number} articleId - 게시글 ID
 * @returns {Promise} 삭제 결과
 */
export function deleteArticle(articleId) {
  const url = `${BASE_URL}/articles/${articleId}`;

  return fetch(url, {
    method: 'DELETE',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }
      // DELETE는 응답 body가 없을 수 있음
      return response.status === 204 ? null : response.json();
    })
    .then(() => {
      console.log(`✅ 게시글 삭제 성공 (ID: ${articleId})`);
      return { success: true, articleId };
    })
    .catch((error) => {
      console.error(`❌ 게시글 삭제 실패 (ID: ${articleId}):`, error.message);
      throw error;
    });
}