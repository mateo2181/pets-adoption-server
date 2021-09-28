import * as express from "express";
import { User } from "../entities/User";
import helper from "./helper";
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';
import { prisma } from "../prisma";
import * as bcrypt from "bcrypt";

async function signUp(req: express.Request, res: express.Response) {
    let { firstname, lastname, email, password } = req.body;
    let user = await prisma.user.create({
        data: {
            firstname,
            lastname,
            email,
            password: bcrypt.hashSync(password, 8)
        }
    });
    const token = helper.createToken(user.id);
    res.send({ token, user: await helper.getUser(token) });
}

async function signUpWithGoogle(req: express.Request, res: express.Response) {
    try {
        const client = new OAuth2Client(process.env.CLIENT_ID);
        const { token } = req.body;
        const ticket: LoginTicket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID
        });
        const { name, email, picture }: TokenPayload = ticket.getPayload() as TokenPayload;

        const user = await prisma.user.upsert({
            where: {
                email
            },
            update: {
                firstname: name,
                picture,
                google: true
            },
            create: {
                firstname: name || '',
                picture,
                email: email || '',
                google: true,
            }
        });
        const tokenGenerated = helper.createToken(user.id);
        res.send({ token: tokenGenerated, user: await helper.getUser(tokenGenerated) });
    } catch (error) {
        res.status(400).send({ error });
        console.log(error);
    }

}

async function signIn(req: express.Request, res: express.Response) {
    try {
        let { email, password } = req.body;
        let user: User | null;
        user = await prisma.user.findUnique({
            where: { email: email },
            select: { id: true, firstname: true, lastname: true, email: true, password: true, roles: true }
        });
        if (!user) {
            throw new Error("User or password incorrect");
        }
        if (!user.password) {
            throw new Error("Your account is associated with Google account. Sign In using Google.");
        }
        if (!user || !bcrypt.compareSync(password, user.password)) {
            throw new Error('User or password incorrect');
        }

        delete user?.password;
        const token = helper.createToken(user.id);
        res.send({ token, user: await helper.getUser(token) });
    } catch (error: any) {
        res.status(401).send({ error: error.message });
    }
}

export default {
    signUp,
    signUpWithGoogle,
    signIn
}