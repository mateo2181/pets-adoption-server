import { PrismaClient } from '@prisma/client'
import { Request } from 'express'
import { User } from './entities/User'

export const prisma = new PrismaClient({
  log: ['query']
})

export interface Context extends Request {
  prisma: PrismaClient,
  user: User;
}