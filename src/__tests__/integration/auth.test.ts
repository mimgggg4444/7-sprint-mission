import request from 'supertest';
import app from '../../app';
import * as usersRepository from '../../repositories/usersRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../repositories/usersRepository');

const mockUsersRepo = usersRepository as jest.Mocked<typeof usersRepository>;

const mockUser = {
  id: 1,
  email: 'test@example.com',
  nickname: 'testuser',
  password: '',
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeAll(async () => {
  mockUser.password = await bcrypt.hash('password123', 10);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /auth/register', () => {
  it('회원가입 성공 시 201과 사용자 정보를 반환한다', async () => {
    mockUsersRepo.getUserByEmail.mockResolvedValue(null);
    mockUsersRepo.createUser.mockResolvedValue({ ...mockUser });

    const res = await request(app).post('/auth/register').send({
      email: 'new@example.com',
      nickname: 'newuser',
      password: 'password123',
      image: null,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('email', 'test@example.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('이미 존재하는 이메일로 가입 시 400을 반환한다', async () => {
    mockUsersRepo.getUserByEmail.mockResolvedValue({ ...mockUser });

    const res = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      nickname: 'testuser',
      password: 'password123',
      image: null,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('필수 필드 누락 시 400을 반환한다', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'test@example.com',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  it('올바른 자격증명으로 로그인 시 200을 반환하고 쿠키를 설정한다', async () => {
    mockUsersRepo.getUserByEmail.mockResolvedValue({ ...mockUser });

    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies.some((c: string) => c.startsWith('access-token='))).toBe(true);
    expect(cookies.some((c: string) => c.startsWith('refresh-token='))).toBe(true);
  });

  it('존재하지 않는 이메일로 로그인 시 400을 반환한다', async () => {
    mockUsersRepo.getUserByEmail.mockResolvedValue(null);

    const res = await request(app).post('/auth/login').send({
      email: 'notexist@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('잘못된 비밀번호로 로그인 시 400을 반환한다', async () => {
    mockUsersRepo.getUserByEmail.mockResolvedValue({ ...mockUser });

    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

describe('POST /auth/logout', () => {
  it('로그아웃 시 200을 반환하고 쿠키를 삭제한다', async () => {
    const res = await request(app).post('/auth/logout');

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'] as unknown as string[];
    if (cookies) {
      expect(cookies.some((c: string) => c.includes('access-token=;'))).toBe(true);
    }
  });
});

describe('POST /auth/refresh', () => {
  it('유효한 refresh token으로 새 토큰을 발급한다', async () => {
    const refreshToken = jwt.sign(
      { id: mockUser.id },
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' },
    );

    mockUsersRepo.getUser.mockResolvedValue({ ...mockUser });

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', [`refresh-token=${refreshToken}`]);

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c: string) => c.startsWith('access-token='))).toBe(true);
  });

  it('refresh token 없이 요청 시 400을 반환한다', async () => {
    const res = await request(app).post('/auth/refresh');

    expect(res.status).toBe(400);
  });
});
