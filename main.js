// ========================================
// 1. 도메인 모델 클래스
// ========================================

class Product {
  #name;
  #description;
  #price;
  #tags;
  #images;
  #favoriteCount;

  constructor(name, description, price, tags = [], images = []) {
    this.#name = name;
    this.#description = description;
    this.#price = price;
    this.#tags = tags;
    this.#images = images;
    this.#favoriteCount = 0;
  }

  favorite() {
    this.#favoriteCount++;
    log(`찜하기 +1 → ${this.#name} (총 ${this.#favoriteCount})`);
  }

  getInfo() {
    return `상품명: ${this.#name}, 가격: ${this.#price}원, 찜: ${this.#favoriteCount}`;
  }
}

class ElectronicProduct extends Product {
  #manufacturer;

  constructor(name, description, price, tags, images, manufacturer) {
    super(name, description, price, tags, images);
    this.#manufacturer = manufacturer;
  }

  getInfo() {
    return `${super.getInfo()}, 제조사: ${this.#manufacturer}`;
  }
}

class Article {
  #title;
  #content;
  #writer;
  #likeCount;
  #createdAt;

  constructor(title, content, writer) {
    this.#title = title;
    this.#content = content;
    this.#writer = writer;
    this.#likeCount = 0;
    this.#createdAt = new Date();
  }

  like() {
    this.#likeCount++;
    log(`좋아요 +1 → '${this.#title}' (총 ${this.#likeCount})`);
  }

  getInfo() {
    return `제목: ${this.#title}, 작성자(이미지): ${this.#writer}, 좋아요: ${this.#likeCount}, 작성일: ${this.#createdAt.toLocaleString("ko-KR")}`;
  }
}


// ========================================
// 2. 서비스 import
// ========================================

import {
  getProductList,
  getProduct,
  createProduct,
  patchProduct,
  deleteProduct,
} from "./ProductService.js";

import {
  getArticleList,
  getArticle,
  createArticle,
  patchArticle,
  deleteArticle,
} from "./ArticleService.js";


// ========================================
// 3. 공통 Helper 함수
// ========================================

function header(title) {
  console.log(`\n🔷 ${title}\n${"=".repeat(50)}`);
}

function sub(title) {
  console.log(`\n➡️  ${title}`);
}

function log(msg) {
  console.log(`   • ${msg}`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


// ========================================
// 4. Product API 테스트 (async/await)
// ========================================

async function testProductAPI() {
  header("Product API 테스트");

  try {
    sub("상품 목록 조회");
    const productListData = await getProductList(1, 10);
    log(`조회됨: ${productListData.list.length}개`);

    sub("상품 인스턴스 생성");
    const products = productListData.list.map((item) => {
      const isElectronic = item.tags.includes("전자제품");
      return isElectronic
        ? new ElectronicProduct(
            item.name,
            item.description,
            item.price,
            item.tags,
            item.images,
            item.manufacturer || "Unknown"
          )
        : new Product(item.name, item.description, item.price, item.tags, item.images);
    });
    log(`총 ${products.length}개 생성됨`);

    if (products.length > 0) {
      products[0].favorite();
      products[0].favorite();
      log(`첫 상품 info → ${products[0].getInfo()}`);
    }

    if (productListData.list.length > 0) {
      sub("상품 상세 조회");
      await getProduct(productListData.list[0].id);
    }

    sub("상품 생성");
    const created = await createProduct({
      name: "테스트 상품",
      description: "API 테스트용 상품입니다",
      price: 10000,
      tags: ["테스트"],
      images: ["https://example.com/item.jpg"],
    });

    const newId = created.id;

    sub("상품 수정");
    await patchProduct(newId, { name: "수정된 테스트 상품", price: 15000 });

    sub("상품 삭제");
    await deleteProduct(newId);

  } catch (err) {
    console.error("❌ Product API 테스트 중 오류:", err.message);
  }
}


// ========================================
// 5. Article API 테스트 (then/catch + async 흐름 조합)
// ========================================

async function testArticleAPI() {
  header("Article API 테스트");

  let createdId = null;

  sub("게시글 목록 조회");
  const list = await getArticleList(1, 10);

  log(`조회됨: ${list.list.length}개`);

  if (list.list.length > 0) {
    sub("게시글 상세 조회");
    await getArticle(list.list[0].id);
  }

  sub("게시글 생성");
  const created = await createArticle({
    title: "테스트 게시글",
    content: "API 테스트용 게시글입니다",
    image: "https://example.com/profile.jpg",
  });

  createdId = created.id;

  sub("게시글 수정");
  await patchArticle(createdId, {
    title: "수정된 테스트 게시글",
    content: "내용 수정 완료",
  });

  sub("게시글 삭제");
  await deleteArticle(createdId);
}


// ========================================
// 6. main() 실행 흐름
// ========================================

async function main() {
  console.log("\n🚀 Panda Market API 프로젝트 시작");
  console.log("=".repeat(50));

  await testProductAPI();

  await delay(500);

  await testArticleAPI();
}

main().catch((err) => {
  console.error("프로그램 실행 중 오류:", err);
});
