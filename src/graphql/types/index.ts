import { User } from "../../entities/User";
import { ReadStream } from "fs";

export interface Context {
    user?: User;
}

export interface FileUpload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream(): ReadStream;
}

export enum PetsStatusEnum {
    has_owner = 'has_owner',
    adoption = 'adoption',
    lost = 'lost'
};
