import { User } from '@prisma/client';

// Request DTOs
export interface SignUpDto {
  email: string;
  nickname: string;
  password: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  nickname: string;
  image: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Response DTOs
export type SafeUserDto = Omit<User, 'password' | 'refreshToken'>;

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: SafeUserDto;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
}

export interface MessageResponseDto {
  message: string;
}
