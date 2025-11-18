import { getArticleList } from "./ArticleService.js";
import { getProductList } from "./ProductService.js";

console.log("🔍 전체 데이터 분석 시작 (병렬 조회)\n");
console.log("=".repeat(70));

/**
 * 병렬로 여러 페이지 조회하여 데이터 모으기
 * @param {Function} fetchFunction - getArticleList 또는 getProductList
 * @param {number} totalItems - 가져올 총 개수
 * @returns {Promise<Array>} 모든 아이템 배열
 */
async function fetchAllPages(fetchFunction, totalItems = 50) {
  const pageSize = 10; // 한 페이지당 10개
  const totalPages = Math.ceil(totalItems / pageSize); // 필요한 페이지 수
  
  console.log(`   📄 ${totalPages}개 페이지 병렬 조회 중...`);
  
  // 모든 페이지를 동시에 요청
  const promises = [];
  for (let page = 1; page <= totalPages; page++) {
    promises.push(fetchFunction(page, pageSize));
  }
  
  // 모든 요청이 완료될 때까지 대기
  const results = await Promise.all(promises);
  
  // 모든 페이지의 list를 하나로 합치기
  const allItems = results.flatMap(result => result.list);
  
  // totalItems 개수만큼만 반환
  return allItems.slice(0, totalItems);
}

async function analyzeAllData() {
  try {
    // Article 데이터 분석 (50개 조회)
    console.log("\n📝 ARTICLE 데이터 분석");
    console.log("-".repeat(70));
    
    const articles = await fetchAllPages(getArticleList, 50);
    console.log(`✅ 총 ${articles.length}개의 게시물 조회 완료\n`);
    
    if (articles.length > 0) {
      const sampleArticle = articles[0];
      console.log("샘플 게시물 (첫 번째):");
      console.log(JSON.stringify(sampleArticle, null, 2));
      
      console.log("\n사용 가능한 Article 필드:");
      Object.keys(sampleArticle).forEach(key => {
        console.log(`   ✓ ${key}`);
      });
      
      // 누락된 필드 확인
      console.log("\n과제에서 요구하지만 API에 없는 필드:");
      const requiredArticleFields = ['title', 'content', 'writer', 'likeCount'];
      requiredArticleFields.forEach(field => {
        if (!(field in sampleArticle)) {
          console.log(`   ✗ ${field} (없음)`);
        }
      });
      
      // 전체 게시물에서 writer/likeCount 있는지 한 번 더 확인
      const hasWriterInAny = articles.some(item => 'writer' in item);
      const hasLikeCountInAny = articles.some(item => 'likeCount' in item);
      
      console.log("\n🔍 50개 게시물 중 확인:");
      console.log(`   writer 필드가 있는 게시물: ${hasWriterInAny ? '있음' : '없음'}`);
      console.log(`   likeCount 필드가 있는 게시물: ${hasLikeCountInAny ? '있음' : '없음'}`);
    }

    console.log("\n" + "=".repeat(70));

    // Product 데이터 분석 (50개 조회)
    console.log("\n🛍️ PRODUCT 데이터 분석");
    console.log("-".repeat(70));
    
    const products = await fetchAllPages(getProductList, 50);
    console.log(`✅ 총 ${products.length}개의 상품 조회 완료\n`);
    
    if (products.length > 0) {
      const sampleProduct = products[0];
      console.log("샘플 상품 (첫 번째):");
      console.log(JSON.stringify(sampleProduct, null, 2));
      
      console.log("\n사용 가능한 Product 필드:");
      Object.keys(sampleProduct).forEach(key => {
        console.log(`   ✓ ${key}`);
      });
      
      // 누락된 필드 확인
      console.log("\n과제에서 요구하지만 API에 없는 필드:");
      const requiredProductFields = ['name', 'description', 'price', 'tags', 'images', 'favoriteCount'];
      requiredProductFields.forEach(field => {
        if (!(field in sampleProduct)) {
          console.log(`   ✗ ${field} (없음)`);
        }
      });
      
      // 전체 상품에서 favoriteCount 있는지 한 번 더 확인
      const hasFavoriteCountInAny = products.some(item => 'favoriteCount' in item);
      
      console.log("\n🔍 50개 상품 중 확인:");
      console.log(`   favoriteCount 필드가 있는 상품: ${hasFavoriteCountInAny ? '있음' : '없음'}`);
      
      // 전자제품 개수 확인
      const electronicCount = products.filter(p => p.tags.includes('전자제품')).length;
      console.log(`   전자제품으로 분류될 상품: ${electronicCount}개`);
    }

    console.log("\n" + "=".repeat(70));
    
    // 최종 요약
    console.log("\n📊 최종 분석 결과");
    console.log("-".repeat(70));
    console.log(`\n조회된 데이터:`);
    console.log(`   • 게시물: ${articles.length}개`);
    console.log(`   • 상품: ${products.length}개`);
    
    console.log("\n누락된 필드 요약:");
    console.log("   Article:");
    console.log("      • writer (작성자) - ❌ API에 없음");
    console.log("      • likeCount (좋아요 수) - ❌ API에 없음");
    console.log("\n   Product:");
    console.log("      • favoriteCount (찜하기 수) - ❌ API에 없음");
    
    console.log("\n💡 해결 방법:");
    console.log("   • 누락된 필드는 클래스에서 기본값으로 초기화");
    console.log("   • writer: '알 수 없음' 또는 null");
    console.log("   • likeCount/favoriteCount: 0부터 시작");
    
    console.log("\n✅ 분석 완료!");
    
  } catch (error) {
    console.error("\n❌ 오류 발생:", error.message);
  }
}

// 실행
analyzeAllData();