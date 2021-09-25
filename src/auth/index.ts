import * as express from "express";
import { checkSchema } from 'express-validator';

import { User } from "../entities/User";
import helper from './helper';
import validations from './validations';
import validateForm from "../utils/formValidation";
import authController from './controller';

const router = express.Router();

router.post('/signUp', validateForm(checkSchema(validations.registrationSchema)), authController.signUp);
router.post('/signUp/google', authController.signUpWithGoogle);
router.post('/signIn', validateForm(checkSchema(validations.loginSchema)), authController.signIn);

export default router;