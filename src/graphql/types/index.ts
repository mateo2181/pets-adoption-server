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


export type File = {
    filename: string;
    mimetype: string;
    encoding: string;
    stream: ReadStream;
  }
  
  export type UploadedFileResponse = {
    filename: string;
    mimetype: string;
    encoding: string;
    url: string;
    filePath: string;
  }
  
  export interface IUploader {
    singleFileUploadResolver: ({ file } : { file: Promise<FileUpload> }) => Promise<UploadedFileResponse>;
    getPubicUrlFromFile: (key: string) => string;
  }