import { prismaClient } from '../lib/prismaClient.js';
import { User, Prisma } from '@prisma/client';

export const userRepository = {
  async findById(id: number): Promise<User | null> {
    return prismaClient.user.findUnique({
      where: { id },
    });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prismaClient.user.findUnique({
      where: { email },
    });
  },

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prismaClient.user.create({
      data,
    });
  },

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prismaClient.user.update({
      where: { id },
      data,
    });
  },

  async delete(id: number): Promise<User> {
    return prismaClient.user.delete({
      where: { id },
    });
  },
};
