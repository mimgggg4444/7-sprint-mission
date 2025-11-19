// ========================================
// 클래스 정의
// ========================================

/**
 * Product 클래스 - 상품 정보를 관리하는 기본 클래스
 */
class Product {
  // private 프로퍼티 (캡슐화)
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
    this.#favoriteCount = 0; // in-memory로 유지
  }

  // Getter 메소드 (캡슐화)
  get name() {
    return this.#name;
  }

  get description() {
    return this.#description;
  }

  get price() {
    return this.#price;
  }

  get tags() {
    return [...this.#tags]; // 배열 복사본 반환 (캡슐화)
  }

  get images() {
    return [...this.#images];
  }

  get favoriteCount() {
    return this.#favoriteCount;
  }

  // 찜하기 메소드 (in-memory에서만 작동)
  favorite() {
    this.#favoriteCount++;
    console.log(`${this.#name}의 찜하기 수: ${this.#favoriteCount}`);
  }

  // 상품 정보 출력 (다형성 - 하위 클래스에서 오버라이드 가능)
  getInfo() {
    return `상품명: ${this.#name}, 가격: ${this.#price}원, 찜: ${this.#favoriteCount}`;
  }
}

/**
 * ElectronicProduct 클래스 - 전자제품 정보를 관리하는 클래스
 * Product 클래스를 상속 (상속)
 */
class ElectronicProduct extends Product {
  #manufacturer;

  constructor(name, description, price, tags = [], images = [], manufacturer) {
    super(name, description, price, tags, images); // 부모 생성자 호출
    this.#manufacturer = manufacturer;
  }

  get manufacturer() {
    return this.#manufacturer;
  }

  // 메소드 오버라이딩 (다형성)
  getInfo() {
    return `${super.getInfo()}, 제조사: ${this.#manufacturer}`;
  }
}

/**
 * Article 클래스 - 게시글 정보를 관리하는 클래스
 * 
 * NOTE: API 버그로 인해 writer 필드가 image로 제공됨
 * 따라서 writer 파라미터에 API의 image 값을 전달받음
 */
class Article {
  // private 프로퍼티 (캡슐화)
  #title;
  #content;
  #writer; // API의 image 필드가 여기 저장됨
  #likeCount;
  #createdAt;

  constructor(title, content, writer) {
    this.#title = title;
    this.#content = content;
    this.#writer = writer; // API의 image 값이 저장됨
    this.#likeCount = 0; // in-memory로 유지
    this.#createdAt = new Date(); // 생성 시점의 현재 시간 저장
  }

  // Getter 메소드
  get title() {
    return this.#title;
  }

  get content() {
    return this.#content;
  }

  get writer() {
    return this.#writer;
  }

  get likeCount() {
    return this.#likeCount;
  }

  get createdAt() {
    return this.#createdAt;
  }

  // 좋아요 메소드 (in-memory에서만 작동)
  like() {
    this.#likeCount++;
    console.log(`${this.#title}의 좋아요 수: ${this.#likeCount}`);
  }

  // 게시글 정보 출력
  getInfo() {
    return `제목: ${this.#title}, 작성자(이미지): ${this.#writer || '없음'}, 좋아요: ${this.#likeCount}, 작성일: ${this.#createdAt.toLocaleString('ko-KR')}`;
  }
}

// ========================================
// 테스트 코드
// ========================================

console.log('=== 클래스 테스트 ===\n');

// Product 인스턴스 생성 테스트
const product1 = new Product(
  '무선 마우스',
  '인체공학적 디자인의 무선 마우스',
  35000,
  ['마우스', '무선', '사무용품'],
  ['mouse1.jpg', 'mouse2.jpg']
);

console.log('1. Product 테스트:');
console.log(product1.getInfo());
product1.favorite();
product1.favorite();
console.log(product1.getInfo());
console.log();

// ElectronicProduct 인스턴스 생성 테스트
const electronicProduct1 = new ElectronicProduct(
  '갤럭시 스마트폰',
  '최신 5G 스마트폰',
  1200000,
  ['전자제품', '스마트폰', '5G'],
  ['phone1.jpg', 'phone2.jpg'],
  'Samsung'
);

console.log('2. ElectronicProduct 테스트:');
console.log(electronicProduct1.getInfo());
electronicProduct1.favorite();
console.log(electronicProduct1.getInfo());
console.log();

// Article 인스턴스 생성 테스트
// NOTE: 실제 API에서는 image 필드가 writer 역할을 함
const article1 = new Article(
  '자바스크립트 클래스 이해하기',
  'ES6에서 도입된 클래스 문법에 대해 알아봅시다.',
  'https://example.com/profile.jpg' // writer 대신 image URL
);

console.log('3. Article 테스트:');
console.log(article1.getInfo());
article1.like();
article1.like();
article1.like();
console.log(article1.getInfo());
console.log();

console.log('=== 클래스 테스트 완료 ===\n');
console.log('💡 참고: favoriteCount와 likeCount는 메모리에서만 유지됩니다.');
console.log('💡 참고: API 버그로 인해 writer는 image 필드로 제공됩니다.');


// ========================================
// API 서비스 Import
// ========================================

import {
  getProductList,
  getProduct,
  createProduct,
  patchProduct,
  deleteProduct,
} from './ProductService.js';

import {
  getArticleList,
  getArticle,
  createArticle,
  patchArticle,
  deleteArticle,
} from './ArticleService.js';

// ========================================
// Product API 테스트
// ========================================

async function testProductAPI() {
  console.log('=== Product API 테스트 시작 ===\n');

  try {
    // 1. 상품 목록 조회
    console.log('1. 상품 목록 조회 테스트');
    const productListData = await getProductList(1, 10);
    console.log(`총 ${productListData.list.length}개의 상품 조회됨\n`);

    // 2. 상품 인스턴스 배열 생성 (전자제품 분류)
    const products = productListData.list.map((item) => {
      const isElectronic = item.tags.includes('전자제품');

      if (isElectronic) {
        return new ElectronicProduct(
          item.name,
          item.description,
          item.price,
          item.tags,
          item.images,
          item.manufacturer || 'Unknown'
        );
      } else {
        return new Product(
          item.name,
          item.description,
          item.price,
          item.tags,
          item.images
        );
      }
    });

    console.log('2. 상품 인스턴스 생성 완료');
    console.log(`- 총 ${products.length}개 인스턴스 생성`);
    console.log(
      `- ElectronicProduct: ${products.filter((p) => p instanceof ElectronicProduct).length}개`
    );
    console.log(
      `- Product: ${products.filter((p) => p instanceof Product && !(p instanceof ElectronicProduct)).length}개`
    );

    // favoriteCount 테스트 (in-memory)
    if (products.length > 0) {
      console.log('\n💡 favoriteCount 테스트 (in-memory):');
      products[0].favorite();
      products[0].favorite();
      console.log(`첫 번째 상품 찜하기 수: ${products[0].favoriteCount}`);
    }
    console.log();

    // 3. 상품 상세 조회
    if (productListData.list.length > 0) {
      console.log('3. 상품 상세 조회 테스트');
      const firstProductId = productListData.list[0].id;
      await getProduct(firstProductId);
      console.log();
    }

    // 4. 상품 생성 테스트
    console.log('4. 상품 생성 테스트');
    const newProduct = await createProduct({
      name: '테스트 상품',
      description: 'API 테스트용 상품입니다',
      price: 10000,
      tags: ['테스트', '샘플'],
      images: ['https://example.com/image.jpg'],
    });
    const createdProductId = newProduct.id;
    console.log(`생성된 상품 ID: ${createdProductId}\n`);

    // 5. 상품 수정 테스트
    console.log('5. 상품 수정 테스트');
    await patchProduct(createdProductId, {
      name: '수정된 테스트 상품',
      price: 15000,
    });
    console.log();

    // 6. 상품 삭제 테스트
    console.log('6. 상품 삭제 테스트');
    await deleteProduct(createdProductId);
    console.log();
  } catch (error) {
    console.error('Product API 테스트 중 오류 발생:', error.message);
  }

  console.log('=== Product API 테스트 완료 ===\n');
}

// ========================================
// Article API 테스트
// ========================================

function testArticleAPI() {
  console.log('=== Article API 테스트 시작 ===\n');

  let createdArticleId;

  // 1. 게시글 목록 조회
  console.log('1. 게시글 목록 조회 테스트');
  getArticleList(1, 10)
    .then((data) => {
      console.log(`총 ${data.list.length}개의 게시글 조회됨\n`);

      // Article 인스턴스 생성 (image를 writer로 사용)
      const articles = data.list.map(item => new Article(
        item.title,
        item.content,
        item.image
      ));

      console.log('💡 Article 인스턴스 생성 완료:');
      console.log(`- 총 ${articles.length}개 생성`);

      // likeCount 테스트 (in-memory)
      if (articles.length > 0) {
        console.log('\n💡 likeCount 테스트 (in-memory):');
        articles[0].like();
        articles[0].like();
        console.log(`첫 번째 게시글 좋아요 수: ${articles[0].likeCount}`);
        console.log(`writer(image): ${articles[0].writer}`);
      }
      console.log();

      // 2. 게시글 상세 조회
      if (data.list.length > 0) {
        console.log('2. 게시글 상세 조회 테스트');
        const firstArticleId = data.list[0].id;
        return getArticle(firstArticleId);
      }
    })
    .then(() => {
      console.log();
      // 3. 게시글 생성 테스트
      console.log('3. 게시글 생성 테스트');
      return createArticle({
        title: '테스트 게시글',
        content: 'API 테스트용 게시글입니다',
        image: 'https://example.com/image.jpg',
      });
    })
    .then((newArticle) => {
      createdArticleId = newArticle.id;
      console.log(`생성된 게시글 ID: ${createdArticleId}\n`);

      // 4. 게시글 수정 테스트
      console.log('4. 게시글 수정 테스트');
      return patchArticle(createdArticleId, {
        title: '수정된 테스트 게시글',
        content: '내용이 수정되었습니다',
      });
    })
    .then(() => {
      console.log();
      // 5. 게시글 삭제 테스트
      console.log('5. 게시글 삭제 테스트');
      return deleteArticle(createdArticleId);
    })
    .then(() => {
      console.log();
      console.log('=== Article API 테스트 완료 ===\n');
    })
    .catch((error) => {
      console.error('Article API 테스트 중 오류 발생:', error.message);
    });
}

// ========================================
// 메인 실행 함수
// ========================================

async function main() {
  console.log('\n🚀 Panda Market API 프로젝트 시작\n');
  console.log('='.repeat(50));
  console.log();

  // Product API 테스트 실행
  await testProductAPI();

  // 약간의 지연 후 Article API 테스트 실행
  setTimeout(() => {
    testArticleAPI();
  }, 1000);
}

// 프로그램 실행
main().catch((error) => {
  console.error('프로그램 실행 중 오류 발생:', error);
});
