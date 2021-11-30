import AWS from 'aws-sdk';
import { File, IUploader, UploadedFileResponse } from '../graphql/types';
import stream from "stream";
import { FileUpload } from 'graphql-upload';

type S3UploadStream = {
    writeStream: stream.PassThrough;
    promise: Promise<AWS.S3.ManagedUpload.SendData>;
};

export class AwsService implements IUploader {

    private s3: AWS.S3;

    constructor() {
        AWS.config.update({
            accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, // Access key ID
            secretAccessKey: process.env.AWS_S3_ACCESS_SECRET_KEY, // Secret access key
            region: process.env.AWS_S3_REGION //Region
        });
        this.s3 = new AWS.S3();
    }

    private createUploadStream(key: string): S3UploadStream {
        const pass = new stream.PassThrough();
        return {
            writeStream: pass,
            promise: this.s3
                .upload({
                    Bucket: process.env.AWS_S3_BUCKET || '',
                    Key: key,
                    Body: pass
                })
                .promise()
        };
    }

    async singleFileUploadResolver({ file }: { file: Promise<FileUpload> }): Promise<UploadedFileResponse> {
        const { createReadStream, filename, mimetype, encoding } = await file;

        const filePath = `${Date.now()}_${filename}`;

        // Create an upload stream that goes to S3
        const uploadStream = this.createUploadStream(filePath);

        // Pipe the file data into the upload stream
        createReadStream().pipe(uploadStream.writeStream);

        // Start the stream
        const result = await uploadStream.promise;

        // Get the link representing the uploaded file
        const link = result.Location;

        return { filename, mimetype, encoding, url: link, filePath };
    }

    // async singleFileUploadResolver({ file }: { file: Promise<FileUpload> }): Promise<UploadedFileResponse> {
    //     try {
    //         const { createReadStream, filename, mimetype, encoding } = await file;

    //         const filePath = `${Date.now()}_${filename}`;

    //         // // Create an upload stream that goes to S3
    //         // const uploadStream = this.createUploadStream(filePath);

    //         // // Pipe the file data into the upload stream
    //         // createReadStream().pipe(uploadStream.writeStream);

    //         // // Start the stream
    //         // const result = await uploadStream.promise;

    //         // // Get the link representing the uploaded file
    //         // const link = result.Location;

    //         // return { filename, mimetype, encoding, url: link, filePath };
    //         const stream = createReadStream();
    //         const chunks: any = [];

    //         let buffer = await new Promise<Buffer>((resolve, reject) => {
    //             let buffer: Buffer;

    //             stream.on('data', function (chunk) {
    //                 chunks.push(chunk);
    //             });

    //             stream.on('end', function () {
    //                 buffer = Buffer.concat(chunks);
    //                 resolve(buffer);
    //             });

    //             stream.on('error', reject);
    //         });

    //         buffer = Buffer.concat(chunks);
    //         // const buffer = Buffer.from(createReadStream , 'base64');
    //         // const fileInfo = await fileType.fromBuffer(buffer);
    //         // const detectedExt = fileInfo.ext;
    //         // const detectedMime = fileInfo.mime;

    //         // if (detectedMime !== body.mime) {
    //         //     return Responses._400({ message: 'mime types dont match' });
    //         // }

    //         console.log(`writing image to bucket called ${process.env.AWS_S3_BUCKET}`);

    //         const { $response: { data } } = await this.s3
    //             .putObject({
    //                 Body: buffer,
    //                 Key: filePath,
    //                 ContentType: mimetype,
    //                 // ACL: 'public-read',
    //                 Bucket: process.env.AWS_S3_BUCKET || ''
    //             })
    //             .promise();

    //         const url = `https://${process.env.AWS_S3_BUCKET}.s3-${process.env.region}.amazonaws.com/${filePath}`;
    //         return { filename, mimetype, encoding, url, filePath };
    //     } catch (error: any) {
    //         return new Promise((_, reject) => reject(error));
    //     }
    // }

    getPubicUrlFromFile(key: string): string {
        const signedUrl = this.s3.getSignedUrl("getObject", {
            Key: key,
            Bucket: process.env.AWS_S3_BUCKET || '',
            Expires: 900, // S3 default is 900 seconds (15 minutes)
        });

        return signedUrl;
    }

    async deleteFile(key: string): Promise<boolean> {
        return this.s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET || '',
            Key: key
        })
            .promise()
            .then(res => { return true })
            .catch(err => {
                console.log(err);
                return false
            });
    }
}