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