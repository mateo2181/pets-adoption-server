import { Location, ParamSchema } from "express-validator";
import { User } from "../entities/User";
import { prisma } from "../prisma";

const locationErrorBody: Location = 'body';

const registrationSchema = {
    firstname: {
        in: locationErrorBody,
        errorMessage: "Firstname field cannot be empty"
    },
    password: {
        in: locationErrorBody,
        isLength: {
            errorMessage: 'Password should be at least 8 chars long',
            options: { min: 8 },
        },
    }
};


const loginSchema = {
    email: {
        in: locationErrorBody,
        errorMessage: "Email field cannot be empty",
        options: { nullable: false }
    },
    password: {
        in: locationErrorBody,
        errorMessage: "Password field cannot be empty",
        options: { nullable: false }
    },
};

export default {
    registrationSchema,
    loginSchema
}