-- =============================================
-- 데이터베이스 스키마 생성
-- =============================================

-- 1. users 테이블
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    provider VARCHAR(50),
    nickname VARCHAR(100),
    image VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE users IS '사용자 테이블';
COMMENT ON COLUMN users.id IS '고유 ID';
COMMENT ON COLUMN users.email IS '이메일';
COMMENT ON COLUMN users.password IS '비밀번호';
COMMENT ON COLUMN users.provider IS '로그인 제공자 (local, google, kakao 등)';
COMMENT ON COLUMN users.nickname IS '닉네임';
COMMENT ON COLUMN users.image IS '프로필 이미지 URL';
COMMENT ON COLUMN users.created_at IS '생성일시';
COMMENT ON COLUMN users.updated_at IS '수정일시';
COMMENT ON COLUMN users.deleted_at IS '삭제일시 (soft delete)';

-- 2. categories 테이블
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE categories IS '카테고리 테이블';
COMMENT ON COLUMN categories.id IS '고유 ID';
COMMENT ON COLUMN categories.name IS '카테고리 명';
COMMENT ON COLUMN categories.created_at IS '생성일시';
COMMENT ON COLUMN categories.updated_at IS '수정일시';
COMMENT ON COLUMN categories.deleted_at IS '삭제일시 (soft delete)';

-- 3. products 테이블
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'SALE',
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_products_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_products_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT chk_products_status 
        CHECK (status IN ('SALE', 'RESERVED', 'SOLD'))
);

COMMENT ON TABLE products IS '상품 테이블';
COMMENT ON COLUMN products.id IS '고유 ID';
COMMENT ON COLUMN products.user_id IS '판매자 유저 ID';
COMMENT ON COLUMN products.category_id IS '카테고리 ID';
COMMENT ON COLUMN products.title IS '상품 제목';
COMMENT ON COLUMN products.description IS '상품 설명';
COMMENT ON COLUMN products.price IS '가격';
COMMENT ON COLUMN products.status IS '판매상태 (SALE, RESERVED, SOLD)';
COMMENT ON COLUMN products.view_count IS '조회수';
COMMENT ON COLUMN products.created_at IS '생성일시';
COMMENT ON COLUMN products.updated_at IS '수정일시';
COMMENT ON COLUMN products.deleted_at IS '삭제일시 (soft delete)';

-- 4. product_images 테이블
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    url VARCHAR(500) NOT NULL,
    image_order INTEGER NOT NULL DEFAULT 0,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_product_images_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

COMMENT ON TABLE product_images IS '상품 이미지 테이블';
COMMENT ON COLUMN product_images.id IS '고유 ID';
COMMENT ON COLUMN product_images.product_id IS '상품 ID';
COMMENT ON COLUMN product_images.url IS '이미지 URL';
COMMENT ON COLUMN product_images.image_order IS '이미지 순서';
COMMENT ON COLUMN product_images.is_main IS '메인 이미지 여부';
COMMENT ON COLUMN product_images.created_at IS '생성일시';
COMMENT ON COLUMN product_images.updated_at IS '수정일시';
COMMENT ON COLUMN product_images.deleted_at IS '삭제일시 (soft delete)';

-- 5. product_comments 테이블
CREATE TABLE product_comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_product_comments_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_comments_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

COMMENT ON TABLE product_comments IS '상품 댓글 테이블';
COMMENT ON COLUMN product_comments.id IS '고유 ID';
COMMENT ON COLUMN product_comments.user_id IS '작성자 유저 ID';
COMMENT ON COLUMN product_comments.product_id IS '상품 ID';
COMMENT ON COLUMN product_comments.content IS '댓글 내용';
COMMENT ON COLUMN product_comments.created_at IS '생성일시';
COMMENT ON COLUMN product_comments.updated_at IS '수정일시';
COMMENT ON COLUMN product_comments.deleted_at IS '삭제일시 (soft delete)';

-- 6. favorites 테이블 (상품 찜)
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_favorites_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_product 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uq_favorites_user_product 
        UNIQUE (user_id, product_id)
);

COMMENT ON TABLE favorites IS '상품 찜 테이블';
COMMENT ON COLUMN favorites.id IS '고유 ID';
COMMENT ON COLUMN favorites.user_id IS '유저 ID';
COMMENT ON COLUMN favorites.product_id IS '상품 ID';
COMMENT ON COLUMN favorites.created_at IS '생성일시';
COMMENT ON COLUMN favorites.updated_at IS '수정일시';
COMMENT ON COLUMN favorites.deleted_at IS '삭제일시 (soft delete)';

-- 7. articles 테이블
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_articles_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE articles IS '게시글 테이블';
COMMENT ON COLUMN articles.id IS '고유 ID';
COMMENT ON COLUMN articles.user_id IS '작성자 유저 ID';
COMMENT ON COLUMN articles.title IS '게시글 제목';
COMMENT ON COLUMN articles.content IS '게시글 내용';
COMMENT ON COLUMN articles.created_at IS '생성일시';
COMMENT ON COLUMN articles.updated_at IS '수정일시';
COMMENT ON COLUMN articles.deleted_at IS '삭제일시 (soft delete)';

-- 8. article_images 테이블
CREATE TABLE article_images (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL,
    url VARCHAR(500) NOT NULL,
    image_order INTEGER NOT NULL DEFAULT 0,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_article_images_article 
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

COMMENT ON TABLE article_images IS '게시글 이미지 테이블';
COMMENT ON COLUMN article_images.id IS '고유 ID';
COMMENT ON COLUMN article_images.article_id IS '게시글 ID';
COMMENT ON COLUMN article_images.url IS '이미지 URL';
COMMENT ON COLUMN article_images.image_order IS '이미지 순서';
COMMENT ON COLUMN article_images.is_main IS '메인 이미지 여부';
COMMENT ON COLUMN article_images.created_at IS '생성일시';
COMMENT ON COLUMN article_images.updated_at IS '수정일시';
COMMENT ON COLUMN article_images.deleted_at IS '삭제일시 (soft delete)';

-- 9. likes 테이블 (게시글 좋아요)
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_likes_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_article 
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    CONSTRAINT uq_likes_user_article 
        UNIQUE (user_id, article_id)
);

COMMENT ON TABLE likes IS '게시글 좋아요 테이블';
COMMENT ON COLUMN likes.id IS '고유 ID';
COMMENT ON COLUMN likes.user_id IS '유저 ID';
COMMENT ON COLUMN likes.article_id IS '게시글 ID';
COMMENT ON COLUMN likes.created_at IS '생성일시';
COMMENT ON COLUMN likes.updated_at IS '수정일시';
COMMENT ON COLUMN likes.deleted_at IS '삭제일시 (soft delete)';

-- 10. article_comments 테이블
CREATE TABLE article_comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_article_comments_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_article_comments_article 
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

COMMENT ON TABLE article_comments IS '게시글 댓글 테이블';
COMMENT ON COLUMN article_comments.id IS '고유 ID';
COMMENT ON COLUMN article_comments.user_id IS '작성자 유저 ID';
COMMENT ON COLUMN article_comments.article_id IS '게시글 ID';
COMMENT ON COLUMN article_comments.content IS '댓글 내용';
COMMENT ON COLUMN article_comments.created_at IS '생성일시';
COMMENT ON COLUMN article_comments.updated_at IS '수정일시';
COMMENT ON COLUMN article_comments.deleted_at IS '삭제일시 (soft delete)';
