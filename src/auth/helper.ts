import { selectFields } from "express-validator/src/select-fields";
import * as jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { prisma } from "../prisma";


function createToken(idUser: number): string {
    const secret = process.env.JWT_SECRET as string;
    return jwt.sign({ userId: idUser }, secret, { expiresIn: "1h" });
}

async function getUser(token: string): Promise<User | null> {
    const secret = process.env.JWT_SECRET as string;
    try {
        if (token) {
            const payload: jwt.JwtPayload = jwt.verify(token, secret) as jwt.JwtPayload;
            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
                select: { id: true, firstname: true, lastname: true, email: true, roles: true }
            });
            return user;
        }
        return Promise.resolve(null);
    } catch (error) {
        return Promise.resolve(null);
    }
}

export default {
    createToken,
    getUser
}