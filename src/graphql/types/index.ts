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

export enum StatusPet {
    HAS_OWNER = "has_owner",
    ADOPTION = "adoption",
    LOST = "lost"
}