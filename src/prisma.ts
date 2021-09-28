import { PrismaClient } from '@prisma/client'
import { User } from './entities/User'

export const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient,
  user: User;
}