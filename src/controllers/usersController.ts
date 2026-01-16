import { Request, Response } from 'express';
import { assert } from 'superstruct';
import { userService } from '../services/userService.js';
import {
  SignUpStruct,
  SignInStruct,
  UpdateUserStruct,
  ChangePasswordStruct,
} from '../structs/usersStruct.js';

export async function signUp(req: Request, res: Response): Promise<void> {
  assert(req.body, SignUpStruct);
  const { email, nickname, password } = req.body;

  const result = await userService.signUp(email, nickname, password);
  res.status(201).send(result);
}

export async function signIn(req: Request, res: Response): Promise<void> {
  assert(req.body, SignInStruct);
  const { email, password } = req.body;

  const result = await userService.signIn(email, password);
  res.status(200).send(result);
}

export async function refreshAccessToken(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  const result = await userService.refreshAccessToken(refreshToken);
  res.status(200).send(result);
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await userService.getMe(req.user!.userId);
  res.status(200).send(user);
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  assert(req.body, UpdateUserStruct);
  const { nickname, image } = req.body;

  const user = await userService.updateMe(req.user!.userId, nickname, image);
  res.status(200).send(user);
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  assert(req.body, ChangePasswordStruct);
  const { currentPassword, newPassword } = req.body;

  const result = await userService.changePassword(req.user!.userId, currentPassword, newPassword);
  res.status(200).send(result);
}

export async function getMyProducts(req: Request, res: Response): Promise<void> {
  const products = await userService.getMyProducts(req.user!.userId);
  res.status(200).send(products);
}

export async function getFavoriteProducts(req: Request, res: Response): Promise<void> {
  const products = await userService.getFavoriteProducts(req.user!.userId);
  res.status(200).send(products);
}
