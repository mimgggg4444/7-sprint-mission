import { getArticleList, getArticle } from "./ArticleService.js";

console.log("📋 기존 게시물 데이터 확인 시작\n");
console.log("=".repeat(60));

// 1. 전체 게시물 목록 조회
getArticleList(1, 100)  // 100개까지 가져오기
  .then((data) => {
    console.log(`\n✅ 총 ${data.totalCount}개의 게시물이 있습니다.\n`);
    console.log(`현재 페이지에서 ${data.list.length}개 조회됨\n`);
    console.log("=".repeat(60));

    // 2. 각 게시물의 전체 필드 확인
    data.list.forEach((article, index) => {
      console.log(`\n📝 게시물 ${index + 1}:`);
      console.log(JSON.stringify(article, null, 2));
      console.log("-".repeat(60));
    });

    // 3. 사용 가능한 필드 목록 정리
    if (data.list.length > 0) {
      console.log("\n🔍 사용 가능한 필드 목록:");
      const firstArticle = data.list[0];
      Object.keys(firstArticle).forEach(key => {
        const value = firstArticle[key];
        const type = typeof value;
        console.log(`   • ${key}: ${type}`);
        if (type === 'string' && value.length > 50) {
          console.log(`     (길이: ${value.length}자)`);
        }
      });
    }

    // 4. writer나 likeCount가 있는지 확인
    console.log("\n❓ 특정 필드 존재 여부:");
    const hasWriter = data.list.some(item => 'writer' in item);
    const hasLikeCount = data.list.some(item => 'likeCount' in item);
    const hasFavoriteCount = data.list.some(item => 'favoriteCount' in item);
    
    console.log(`   • writer: ${hasWriter ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   • likeCount: ${hasLikeCount ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   • favoriteCount: ${hasFavoriteCount ? '✅ 있음' : '❌ 없음'}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ 데이터 확인 완료!");

    // 5. 첫 번째 게시물 상세 조회 (혹시 목록과 다를 수 있으니)
    if (data.list.length > 0) {
      const firstId = data.list[0].id;
      console.log(`\n\n🔎 첫 번째 게시물 상세 조회 (ID: ${firstId})...\n`);
      return getArticle(firstId);
    }
  })
  .then((detailData) => {
    if (detailData) {
      console.log("📄 상세 조회 결과:");
      console.log(JSON.stringify(detailData, null, 2));
      
      console.log("\n🔍 상세 조회에만 있는 필드가 있는지 확인:");
      console.log(`   • writer: ${'writer' in detailData ? '✅ 있음' : '❌ 없음'}`);
      console.log(`   • likeCount: ${'likeCount' in detailData ? '✅ 있음' : '❌ 없음'}`);
    }
  })
  .catch((error) => {
    console.error("\n❌ 오류 발생:", error.message);
  });