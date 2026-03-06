# Panda Market API

## 환경 변수 설정
`.env.example` 파일을 참고해서 필요한 환경 변수를 설정해 주세요.

## 설치

의존성 패키지를 설치합니다.

```
npm install
```

Prisma와 데이터베이스를 준비합니다.
```
npx prisma generate
npx prisma migrate dev
```

## 실행

`npm dev`로 개발 모드로 실행할 수 있습니다.

## 코드 구현 설명

### 엔드포인트 목록

- articlesRouter
  * `POST /articles`: 게시글 생성
  * `GET /articles`: 게시글 목록 조회
  * `GET /articles/:id`: 게시글 상세 조회
  * `PATCH /articles/:id`: 게시글 수정
  * `DELETE /articles/:id`: 게시글 삭제
  * `POST /articles/:id/comments`: 게시글에 댓글 작성
  * `GET /articles/:id/comments`: 게시글의 댓글 목록 조회
  * `POST /articles/:id/likes`: 게시글 좋아요
  * `DELETE /articles/:id/likes`: 게시글 좋아요 취소
- productsRouter
  * `POST /products`: 상품 등록
  * `GET /products`: 상품 목록 조회
  * `GET /products/:id`: 상품 상세 조회
  * `PATCH /products/:id`: 상품 수정
  * `DELETE /products/:id`: 상품 삭제
  * `POST /products/:id/comments`: 상품에 댓글 작성
  * `GET /products/:id/comments`: 상품의 댓글 목록 조회
  * `POST /products/:id/favorites`: 상품 좋아요
  * `DELETE /products/:id/favorites`: 상품 좋아요 취소
- commentsRouter
  * `PATCH /comments/:id`: 댓글 수정
  * `DELETE /comments/:id`: 댓글 삭제
- notificationsRouter
  * `PATCH /notifications/:id/read`: 알림 읽음 처리
- usersRouter
  * `GET /users/me`: 내 정보 조회
  * `PATCH /users/me`: 내 정보 수정
  * `PATCH /users/me/password`: 내 비밀번호 변경
  * `GET /users/me/products`: 내가 등록한 상품 목록 조회
  * `GET /users/me/favorites`: 내가 좋아요한 상품 목록 조회
  * `GET /users/me/notifications`: 내 알림 목록 조회
- authRouter
  * `POST /auth/register`: 회원가입
  * `POST /auth/login`: 로그인
  * `POST /auth/logout`: 로그아웃
  * `POST /auth/refresh`: 토큰 재발급
- imagesRouter
  * `POST /images/upload`: 이미지 업로드



### Notification 모델

```ts
interface Notification {
  id: number;
  userId: number;
  read: boolean;
  type: 'NEW_COMMENT' | 'PRICE_CHANGED';
  payload: object;
  createdAt: Date;
  updatedAt: Date;
}
```
- 이벤트 타입과 페이로드를 포함하고 있습니다.
- 페이로드는 `articleId`나 `productId`와 `price` 같은 해당 이벤트를 클라이언트가 처리하는데 필요한 데이터를 담고 있습니다.

### NotificationsService
- Notification을 생성, 수정하는 책임을 갖습니다.
- Notification을 생성하면 SocketService에 해당 Notification을 전달합니다.

### SocketService

- Socket.IO 연결을 관리합니다.
- 미들웨어에서 액세스 토큰을 확인하고 인증을 처리합니다.
  - 인증에 성공하면 해당 소켓을 `userId`를 기준으로 room에 join시킵니다.
  - 하나의 사용자가 여러 브라우저 탭 등에서 접속 가능하기 때문에, `userId` room에는 여러 소켓이 join할 수 있습니다.
- `sendNotification()` 함수에서는 `userId`를 가지고 해당하는 room에 메시지를 보냅니다.


### 전체적인 동작 순서

알림이 발생하면(예: 댓글, 가격 변경 등)

→ 해당 서비스가 NotificationsService에 Notification 생성 요청

→ NotificationsService가 DB에 알림 저장

→ 저장된 알림을 SocketService로 전달

→ SocketService가 해당 사용자에게 실시간으로 알림 전송

## Notification 테스트

`/public/socket-client-test.html` 파일에 Socket.IO 클라이언트를 테스트할 수 있는 프론트엔드 코드가 구현되어 있습니다.
`http://localhost:3000/public/socket-client-test.html`로 접속할 수 있습니다.

### socket-client-test.html
- JWT 토큰을 인풋에 입력하고 버튼을 누르면, Socket.IO 클라이언트로 `http://localhost:3000` 으로 접속합니다.
- `notification`라는 이벤트를 메시지로 받으면 콘솔에 받은 메시지를 출력합니다.


### 테스트 시나리오
- 준비하기
  - User 1 회원가입
  - User 1으로 로그인
  - socket-client-test.html에서 User 1으로 접속
  - (테스트를 위해 액세스 토큰은 기록해 둡니다.)
  - User 2 회원가입
  - User 2로 로그인
  - socket-client-test.html에서 User 2로 접속
  - (테스트를 위해 액세스 토큰은 기록해 둡니다.)
- 게시물 댓글 알림 테스트
  - User 1이 게시물 등록
  - User 2가 게시물 댓글 등록
  - User 1의 소켓 클라이언트에서 메시지가 잘 오는지 확인
  - User 2의 소켓 클라이언트에서는 오는 메시지가 없도록 확인
- 상품 가격 알림 테스트
  - User 1이 상품 등록
  - User 2가 상품 좋아요
  - User 1이 상품 가격 수정
  - User 1의 소켓 클라이언트에서 메시지가 잘 오는지 확인
  - User 2의 소켓 클라이언트에서는 오는 메시지가 없도록 확인
