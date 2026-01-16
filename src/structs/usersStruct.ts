import { object, string, size, refine, Infer } from 'superstruct';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignUpStruct = object({
  email: refine(string(), 'email', (value) => emailPattern.test(value)),
  nickname: size(string(), 1, 50),
  password: size(string(), 8, 100),
});

export const SignInStruct = object({
  email: refine(string(), 'email', (value) => emailPattern.test(value)),
  password: string(),
});

export const UpdateUserStruct = object({
  nickname: size(string(), 1, 50),
  image: string(),
});

export const ChangePasswordStruct = object({
  currentPassword: string(),
  newPassword: size(string(), 8, 100),
});

// Inferred types
export type SignUpData = Infer<typeof SignUpStruct>;
export type SignInData = Infer<typeof SignInStruct>;
export type UpdateUserData = Infer<typeof UpdateUserStruct>;
export type ChangePasswordData = Infer<typeof ChangePasswordStruct>;
