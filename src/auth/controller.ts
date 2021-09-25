import * as express from "express";
import { User } from "../entities/User";
import helper from "./helper";
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library';

async function signUp(req: express.Request, res: express.Response) {
    let { firstname, lastname, email, password } = req.body;
    let user = User.create({ firstname, lastname, email, password });
    user.hashPassword();
    await user.save();
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

        const user = await User.createQueryBuilder()
            .insert()
            .values({ firstname: name, email, picture, google: true })
            .orUpdate(['firstname', 'picture'], ['email'])
            .execute();
        const tokenGenerated = helper.createToken(user.identifiers[0].id);
        res.send({ token: tokenGenerated, user: await helper.getUser(tokenGenerated) });
    } catch (error) {
        res.status(400).send({error}); 
        console.log(error);
    }

}

async function signIn(req: express.Request, res: express.Response) {
    let { email, password } = req.body;
    let user: User | undefined;
    user = await User.findOne({ where: { email } });
    if (!user || !user.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
    }

    const token = helper.createToken(user.id);
    res.send({ token, user: await helper.getUser(token) });
}

export default {
    signUp,
    signUpWithGoogle,
    signIn
}