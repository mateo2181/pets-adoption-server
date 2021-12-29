import { prisma } from "../prisma";
import { AwsService } from "../utils/aws";
import AWS from 'aws-sdk';
export async function addPetAvatar(event: any) {
    // try {
    // const awsService = new AwsService();
    AWS.config.update({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, // Access key ID
        secretAccessKey: process.env.AWS_S3_ACCESS_SECRET_KEY, // Secret access key
        region: process.env.AWS_S3_REGION //Region
    });
    const s3 = new AWS.S3();
    //     console.log(event);
    //     let { petId, file } = JSON.parse(event.body);
    //     const decodedFile = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), "base64");
    //     if (!petId) throw new Error("Invalid Pet ID");
    //     const pet = await prisma.pet.findUnique({ where: { id: Number(petId) } });
    //     if (!pet) throw new Error("Pet not found");

    //     // const data = await awsService.singleFileUploadResolver({ file: decodedFile });

    //     // const picture = await prisma.petPictures.create({
    //     //   data: {
    //     //     path: data.url,
    //     //     pet: {
    //     //       connect: { id: pet.id }
    //     //     }
    //     //   }
    //     // });
    //     return { 
    //         statusCode: 200, 
    //         body: JSON.stringify({ url: 'data.url' }) 
    //     };
    //   } catch (error) {
    //     console.log(error);
    //     return {
    //         statusCode: 400,
    //         body: JSON.stringify({ error })
    //     }

    console.log(event);

    const response = {
        isBase64Encoded: false,
        statusCode: 200,
        body: JSON.stringify({ message: "Successfully uploaded file to S3" }),
    };

    try {
        const parsedBody = JSON.parse(event.body);
        const base64File = parsedBody.file;
        const decodedFile = Buffer.from(base64File.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const params = {
            Bucket: process.env.AWS_S3_BUCKET || '',
            Key: `images/${new Date().toISOString()}.jpeg`,
            Body: decodedFile,
            ContentType: "image/jpeg",
        };

        const uploadResult = await s3.upload(params).promise();

        response.body = JSON.stringify({ message: "Successfully uploaded file to S3", uploadResult });
    } catch (e) {
        console.error(e);
        response.body = JSON.stringify({ message: "File failed to upload", errorMessage: e });
        response.statusCode = 500;
    }
    return response;
    //   }
}