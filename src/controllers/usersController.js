import { assert } from 'superstruct';
import prisma from '../lib/prismaClient.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../lib/authUtils.js';
import {
  SignUpStruct,
  SignInStruct,
  UpdateUserStruct,
  ChangePasswordStruct,
} from '../structs/usersStruct.js';
import BadRequestError from '../lib/errors/BadRequestError.js';
import NotFoundError from '../lib/errors/NotFoundError.js';
import UnauthorizedError from '../lib/errors/UnauthorizedError.js';

function excludePassword(user) {
  const { password, refreshToken, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function signUp(req, res) {
  assert(req.body, SignUpStruct);
  const { email, nickname, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new BadRequestError('Email already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      nickname,
      password: hashedPassword,
    },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return res.status(201).send({
    accessToken,
    refreshToken,
    user: excludePassword(user),
  });
}

export async function signIn(req, res) {
  assert(req.body, SignInStruct);
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return res.status(200).send({
    accessToken,
    refreshToken,
    user: excludePassword(user),
  });
}

export async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new BadRequestError('Refresh token is required');
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== refreshToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const newAccessToken = generateAccessToken(user.id);

  return res.status(200).send({
    accessToken: newAccessToken,
  });
}

export async function getMe(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return res.status(200).send(excludePassword(user));
}

export async function updateMe(req, res) {
  assert(req.body, UpdateUserStruct);
  const { nickname, image } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: { nickname, image },
  });

  return res.status(200).send(excludePassword(user));
}

export async function changePassword(req, res) {
  assert(req.body, ChangePasswordStruct);
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: req.user.userId },
    data: { password: hashedPassword },
  });

  return res.status(200).send({ message: 'Password changed successfully' });
}

export async function getMyProducts(req, res) {
  const products = await prisma.product.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: 'desc' },
  });

  return res.status(200).send(products);
}

export async function getFavoriteProducts(req, res) {
  const favorites = await prisma.productLike.findMany({
    where: { userId: req.user.userId },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const products = favorites.map((favorite) => favorite.product);

  return res.status(200).send(products);
}
