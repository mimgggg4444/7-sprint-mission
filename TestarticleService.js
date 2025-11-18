import { getArticleList } from "./ArticleService.js";

console.log("게시글 데이터 구조 확인중...\n");

getArticleList(1, 2) // 2개만 조회
  .then((data) => {
    console.log("✅ 전체 응답 데이터 구조:");
    console.log(JSON.stringify(data, null, 2)); // 전체 데이터 예쁘게 출력
    
    console.log("\n" + "=".repeat(50));
    console.log("\n✅ 첫 번째 게시글 상세:");
    console.log(JSON.stringify(data.list[0], null, 2));
  })
  .catch((error) => {
    console.error('❌ 오류:', error.message);
  });