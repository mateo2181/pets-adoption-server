import * as express from "express";
import { checkSchema } from 'express-validator';

import { User } from "../entities/User";
import helper from './helper';
import validations from './validations';
import validateForm from "../utils/formValidation";
import authController from './controller';

const router = express.Router();

router.post('/signInWithCredentials', validateForm(checkSchema(validations.registrationSchema)), authController.signInWithCredentials);
router.post('/signIn', validateForm(checkSchema(validations.loginSchema)), authController.signIn);

export default router;




// const jwt = require('jsonwebtoken');
// const jwksClient = require('jwks-rsa');
// require('dotenv').config();

// const getHeader = (req: any) => {
//     const authHeader = req.headers.authorization || '';
//     return authHeader; 
// }

// function getKey(header: any, callback: any) {
//     const client = jwksClient({
//         jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
//     });
    
//     client.getSigningKey(header.kid, function(error: any, key: any) {
//       var signingKey = key.publicKey || key.rsaPublicKey;
//       callback(null, signingKey);
//     });
// }
  
// export async function verifyToken(token: String): Promise<any> {
//       const bearerToken = token.split(' ');
  
//       return new Promise((resolve, reject) => {
//         jwt.verify(
//           bearerToken[1],
//           getKey,
//           {
//             audience: process.env.AUTH0_AUDIENCE,
//             issuer: `https://${process.env.AUTH0_DOMAIN}/`,
//             algorithms: ['RS256'],
//           },
//           (error: any, decoded: any) => {
//             if (error) reject({ error });
//             resolve({ decoded });
//           },
//         );
//       });  
  
//   }

