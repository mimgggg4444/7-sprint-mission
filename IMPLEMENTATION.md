# 스프린트 미션 4 구현 완료

## 구현된 기능

### 1. 인증 (Authentication)

#### User 스키마
- `id`, `email`, `nickname`, `image`, `password`, `refreshToken`, `createdAt`, `updatedAt` 필드 구현
- email은 unique 제약조건 적용
- Article, Product, Comment와의 관계 설정

#### 회원가입 API
- **POST** `/users/signup`
- email, nickname, password를 받아 회원가입
- password는 bcrypt로 해싱하여 저장
- Access Token과 Refresh Token 발급

#### 로그인 API
- **POST** `/users/signin`
- email, password로 로그인
- Access Token과 Refresh Token 발급

#### 토큰 갱신 API (심화)
- **POST** `/users/refresh`
- Refresh Token으로 새로운 Access Token 발급

### 2. 인가 (Authorization)

#### 상품 기능
- **POST** `/products` - 로그인한 유저만 상품 등록 가능
- **PATCH** `/products/:id` - 상품 작성자만 수정 가능
- **DELETE** `/products/:id` - 상품 작성자만 삭제 가능

#### 게시글 기능
- **POST** `/articles` - 로그인한 유저만 게시글 등록 가능
- **PATCH** `/articles/:id` - 게시글 작성자만 수정 가능
- **DELETE** `/articles/:id` - 게시글 작성자만 삭제 가능

#### 댓글 기능
- **POST** `/products/:id/comments` - 로그인한 유저만 댓글 등록 가능
- **POST** `/articles/:id/comments` - 로그인한 유저만 댓글 등록 가능
- **PATCH** `/comments/:id` - 댓글 작성자만 수정 가능
- **DELETE** `/comments/:id` - 댓글 작성자만 삭제 가능

### 3. 유저 정보 관리

- **GET** `/users/me` - 자신의 정보 조회 (비밀번호 제외)
- **PATCH** `/users/me` - 자신의 정보 수정 (nickname, image)
- **PATCH** `/users/me/password` - 비밀번호 변경
- **GET** `/users/me/products` - 자신이 등록한 상품 목록 조회

### 4. 좋아요 기능 (심화)

#### 스키마
- `ProductLike` 모델: 상품 좋아요
- `ArticleLike` 모델: 게시글 좋아요
- userId와 productId/articleId의 unique 조합으로 중복 방지

#### API
- **POST** `/products/:id/like` - 상품 좋아요/취소 토글
- **POST** `/articles/:id/like` - 게시글 좋아요/취소 토글
- **GET** `/users/me/favorite-products` - 좋아요한 상품 목록 조회

#### 조회 시 isLiked 필드
- **GET** `/products/:id` - 상품 조회 시 isLiked, likeCount 포함
- **GET** `/articles/:id` - 게시글 조회 시 isLiked, likeCount 포함

## 기술 스택

- **인증**: bcrypt (비밀번호 해싱), jsonwebtoken (JWT)
- **데이터베이스**: PostgreSQL with Prisma ORM
- **유효성 검사**: superstruct

## 보안 구현

1. **비밀번호 해싱**: bcrypt 사용 (salt rounds: 10)
2. **JWT 토큰**: 
   - Access Token: 1시간 유효
   - Refresh Token: 7일 유효
3. **비밀번호 제외**: 유저 정보 반환 시 password, refreshToken 필드 제외
4. **권한 검증**: 작성자만 수정/삭제 가능하도록 ForbiddenError 처리

## 미들웨어

### authenticate
- Authorization 헤더에서 Bearer 토큰 검증
- 유효한 토큰인 경우 `req.user`에 userId 설정
- 필수 인증이 필요한 API에 사용

### optionalAuthenticate
- 토큰이 있으면 검증하지만, 없어도 통과
- 상품/게시글 조회 시 로그인 여부에 따라 isLiked 값 설정

## 에러 처리

- `UnauthorizedError` (401): 인증 실패
- `ForbiddenError` (403): 권한 없음
- `BadRequestError` (400): 잘못된 요청
- `NotFoundError` (404): 리소스 없음

## 환경 변수 (.env)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/panda-market
PORT=3000
JWT_ACCESS_SECRET=your-access-token-secret-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-key-here
```

## 데이터베이스 마이그레이션 실행 방법

1. PostgreSQL 데이터베이스가 실행 중인지 확인
2. .env 파일에 DATABASE_URL 설정
3. 마이그레이션 실행:
   ```bash
   npx prisma migrate dev --name add-user-auth
   ```
4. Prisma Client 생성:
   ```bash
   npx prisma generate
   ```

## 실행 방법

```bash
npm install
npm start
```

## API 엔드포인트 목록

### 인증
- POST /users/signup - 회원가입
- POST /users/signin - 로그인
- POST /users/refresh - 토큰 갱신

### 유저
- GET /users/me - 내 정보 조회
- PATCH /users/me - 내 정보 수정
- PATCH /users/me/password - 비밀번호 변경
- GET /users/me/products - 내가 등록한 상품
- GET /users/me/favorite-products - 좋아요한 상품

### 상품
- POST /products - 상품 등록 (인증 필요)
- GET /products/:id - 상품 조회 (isLiked 포함)
- PATCH /products/:id - 상품 수정 (작성자만)
- DELETE /products/:id - 상품 삭제 (작성자만)
- GET /products - 상품 목록
- POST /products/:id/like - 좋아요 토글 (인증 필요)
- POST /products/:id/comments - 댓글 작성 (인증 필요)
- GET /products/:id/comments - 댓글 목록

### 게시글
- POST /articles - 게시글 등록 (인증 필요)
- GET /articles/:id - 게시글 조회 (isLiked 포함)
- PATCH /articles/:id - 게시글 수정 (작성자만)
- DELETE /articles/:id - 게시글 삭제 (작성자만)
- GET /articles - 게시글 목록
- POST /articles/:id/like - 좋아요 토글 (인증 필요)
- POST /articles/:id/comments - 댓글 작성 (인증 필요)
- GET /articles/:id/comments - 댓글 목록

### 댓글
- PATCH /comments/:id - 댓글 수정 (작성자만)
- DELETE /comments/:id - 댓글 삭제 (작성자만)

## 구현 완료 체크리스트

### 기본 요구사항
- [x] User 스키마 작성
- [x] 회원가입 API (비밀번호 해싱)
- [x] 로그인 API (Access Token 발급)
- [x] 상품 등록/수정/삭제 인가
- [x] 게시글 등록/수정/삭제 인가
- [x] 댓글 등록/수정/삭제 인가
- [x] 유저 정보 조회
- [x] 유저 정보 수정
- [x] 비밀번호 변경
- [x] 유저가 등록한 상품 목록 조회
- [x] 비밀번호 리스폰스 제외

### 심화 요구사항
- [x] Refresh Token 구현
- [x] 상품 좋아요 기능
- [x] 게시글 좋아요 기능
- [x] isLiked 필드 포함
- [x] 좋아요한 상품 목록 조회
- [x] Prisma 관계형 활용
