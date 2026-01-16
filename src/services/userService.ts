import { User } from '@prisma/client';
import { userRepository } from '../repositories/userRepository.js';
import { likeRepository } from '../repositories/likeRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../lib/authUtils.js';
import BadRequestError from '../lib/errors/BadRequestError.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import UnauthorizedError from '../lib/errors/UnauthorizedError.js';

export type SafeUser = Omit<User, 'password' | 'refreshToken'>;

function excludePassword(user: User): SafeUser {
  const { password, refreshToken, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export const userService = {
  async signUp(email: string, nickname: string, password: string) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('Email already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user = await userRepository.create({
      email,
      nickname,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await userRepository.update(user.id, { refreshToken });

    return {
      accessToken,
      refreshToken,
      user: excludePassword(user),
    };
  },

  async signIn(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await userRepository.update(user.id, { refreshToken });

    return {
      accessToken,
      refreshToken,
      user: excludePassword(user),
    };
  },

  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user.id);
    return { accessToken: newAccessToken };
  },

  async getMe(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    return excludePassword(user);
  },

  async updateMe(userId: number, nickname: string, image: string) {
    const user = await userRepository.update(userId, { nickname, image });
    return excludePassword(user);
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await userRepository.update(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  },

  async getMyProducts(userId: number) {
    return productRepository.findByUserId(userId);
  },

  async getFavoriteProducts(userId: number) {
    return likeRepository.findUserFavoriteProducts(userId);
  },
};
