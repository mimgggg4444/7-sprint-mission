// ====
// 클래스 정의
// ====

/**
 * .
 */
class Product {
  //
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

  // 
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

  // 
  favorite() {
    this.#favoriteCount++;
    console.log(`${this.#name}의 찜하기 수: ${this.#favoriteCount}`);
  }

  // 
  getInfo() {
    return `상품명: ${this.#name}, 가격: ${this.#price}원, 찜: ${this.#favoriteCount}`;
  }
}

/**
 * .
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

  // 
  getInfo() {
    return `${super.getInfo()}, 제조사: ${this.#manufacturer}`;
  }
}

/**
 * .
 */
class Article {
  //
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

  // 
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

  //
  like() {
    this.#likeCount++;
    console.log(`${this.#title}의 좋아요 수: ${this.#likeCount}`);
  }

  //
  getInfo() {
    return `제목: ${this.#title}, 작성자: ${this.#writer}, 좋아요: ${this.#likeCount}, 작성일: ${this.#createdAt.toLocaleString('ko-KR')}`;
  }
}

// ====
// 테코
// ====

console.log('=== 클래스 test ===\n');

//
const product1 = new Product(
  '키보드',
  'test desc',
  35000,
  ['키보드', '전자제품'], // ''
  ['test.jpg', 'test2.jpg'] // 
);

console.log('1. Product test:');
console.log(product1.getInfo());
product1.favorite();
product1.favorite();
console.log();

//
const electronicProduct1 = new ElectronicProduct(
  'i 13 ',
  '5G phone',
  1200000,
  ['전자제품', '스마트폰', '5G'],
  ['test.jpg', 'test.jpg'], //img
  'apple'
);

console.log('2. ElectronicProduct test:');
console.log(electronicProduct1.getInfo());
electronicProduct1.favorite();
console.log();

//
const article1 = new Article(
  'test',
  'test desc',
  'test name'
);

console.log('3. Article  test:');
console.log(article1.getInfo());
article1.like();
article1.like();
article1.like();
console.log();

console.log('=== 클래스 테스트완료 ===\n');