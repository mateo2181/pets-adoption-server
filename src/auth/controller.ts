import * as express from "express";
import { User } from "../entities/User";
import helper from "./helper";
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';
import { prisma } from "../prisma";
import * as bcrypt from "bcrypt";

export async function signInWithCredentials(event: any) {
    try {
        let { email, password } = JSON.parse(event.body);
        let user: User | null;
        user = await prisma.user.findUnique({
            where: { email: email },
            select: { id: true, name: true, email: true, password: true, roles: true }
        });
        // If the user exists check that the password match.
        if (user) {
            if (!bcrypt.compareSync(password, user.password || '')) {
                throw new Error('User or password incorrect');
            }
        } else {
            // If the user was not found, we CREATE a NEW USER using email and password.
            const hash = await bcrypt.hash(password, 8);
            let rolePublic = await prisma.rol.findFirst({ where: { name: 'PUBLIC' } });
            if (!rolePublic) {
                throw new Error("Role PUBLIC not found");
            }
            user = await prisma.user.create({
                data: {
                    email,
                    password: hash,
                    roles: { connect: { id: rolePublic?.id } }
                },
            });

        }

        const token = helper.createToken(user.id);
        return {
            statusCode: 200,
            body: JSON.stringify({ token, email: user.email, name: user.name })
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error })
        }
    }
}

async function signUpWithGoogle(req: express.Request, res: express.Response) {
    // try {
    //     const client = new OAuth2Client(process.env.CLIENT_ID);
    //     const { token } = req.body;
    //     const ticket: LoginTicket = await client.verifyIdToken({
    //         idToken: token,
    //         audience: process.env.CLIENT_ID
    //     });
    //     const { name, email, picture }: TokenPayload = ticket.getPayload() as TokenPayload;

    //     const user = await prisma.user.upsert({
    //         where: {
    //             email
    //         },
    //         update: {
    //             firstname: name,
    //             picture,
    //             google: true
    //         },
    //         create: {
    //             firstname: name || '',
    //             picture,
    //             email: email || '',
    //             google: true,
    //         }
    //     });
    //     const tokenGenerated = helper.createToken(user.id);
    //     res.send({ token: tokenGenerated, user: await helper.getUser(tokenGenerated) });
    // } catch (error) {
    //     res.status(400).send({ error });
    //     console.log(error);
    // }

}

export async function signIn(event: any) {
    try {
        let { name, email, picture } = JSON.parse(event.body);
        let user: User | null;
        user = await prisma.user.upsert({
            where: { email: email },
            update: {
                name,
                image: picture
            },
            create: {
                name: name || '',
                image: picture,
                email: email || ''
            }
        });
        if (!user) {
            throw new Error("User or password incorrect");
        }
        // if (!user.password) {
        //     throw new Error("Your account is associated with Google account. Sign In using Google.");
        // }
        // if (!user || !bcrypt.compareSync(password, user.password)) {
        //     throw new Error('User or password incorrect');
        // }

        // delete user?.password;
        const token = helper.createToken(user.id);
        return {
            statusCode: 200,
            body: JSON.stringify({ token, user: await helper.getUser(token) })
        };
    } catch (error: any) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error })
        }
    }
}

export default {
    signInWithCredentials,
    signUpWithGoogle,
    signIn
}