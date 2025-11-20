// ========================================
// Article API Service
// ========================================

const BASE_URL = 'https://panda-market-api-crud.vercel.app';

/**
 * 쿼리 스트링 생성 유틸
 * - page, pageSize는 숫자를 문자열로 변환
 * - keyword가 비어있으면 포함하지 않음
 */
function buildQuery({ page, pageSize, keyword }) {
  const params = new URLSearchParams();

  if (page != null) {
    params.set('page', String(page));
  }

  if (pageSize != null) {
    params.set('pageSize', String(pageSize));
  }

  if (keyword) {
    params.set('keyword', keyword);
  }

  return params.toString();
}

/**
 * fetch 응답 상태코드 검증
 * - 2xx 가 아니면 예외 발생
 */
function validateResponse(response) {
  if (!response.ok) {
    // 상태 코드와 상태 텍스트만 담아서 깔끔하게
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

/**
 * 공통 성공 로그
 */
function logSuccess(message) {
  console.log(`✅ ${message}`);
}

/**
 * 공통 에러 로그
 */
function logError(context, error) {
  console.error(`❌ ${context}: ${error.message}`);
}

/**
 * JSON 응답 파싱
 */
function parseJson(response) {
  return response.json();
}

/**
 * 게시글 목록 조회
 * @param {number} page - 페이지 번호
 * @param {number} pageSize - 페이지 크기
 * @param {string} keyword - 검색 키워드
 * @returns {Promise} 게시글 목록
 */
export function getArticleList(page = 1, pageSize = 10, keyword = '') {
  const query = buildQuery({ page, pageSize, keyword });
  const url = `${BASE_URL}/articles?${query}`;
  return fetch(url)
    .then(validateResponse)
    .then(parseJson)
    .then((data) => {
      logSuccess('게시글 목록 조회 성공');
      return data;
    })
    .catch((error) => {
      logError('게시글 목록 조회 실패', error);
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
    .then(validateResponse)
    .then(parseJson)
    .then((data) => {
      logSuccess(`게시글 조회 성공 (ID: ${articleId})`);
      return data;
    })
    .catch((error) => {
      logError(`게시글 조회 실패 (ID: ${articleId})`, error);
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
    .then(validateResponse)
    .then(parseJson)
    .then((data) => {
      logSuccess('게시글 생성 성공');
      return data;
    })
    .catch((error) => {
      logError('게시글 생성 실패', error);
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
    .then(validateResponse)
    .then(parseJson)
    .then((data) => {
      logSuccess(`게시글 수정 성공 (ID: ${articleId})`);
      return data;
    })
    .catch((error) => {
      logError(`게시글 수정 실패 (ID: ${articleId})`, error);
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
    .then(validateResponse)
    .then((response) => {
      // DELETE는 응답 body가 없을 수 있음
      if (response.status === 204) {
        return null;
      }
      return response.json();
    })
    .then(() => {
      logSuccess(`게시글 삭제 성공 (ID: ${articleId})`);
      return { success: true, articleId };
    })
    .catch((error) => {
      logError(`게시글 삭제 실패 (ID: ${articleId})`, error);
      throw error;
    });
}