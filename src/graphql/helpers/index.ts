export function getDefaultUrlImageByPetType(petType: string) {
    switch(petType) {
        case 'cat':
            return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${process.env.AWS_S3_DEFAULT_IMAGE_CAT}`;
        case 'dog':
            return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${process.env.AWS_S3_DEFAULT_IMAGE_DOG}`;
        case 'default':
            return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${process.env.AWS_S3_DEFAULT_IMAGE}`;
        default:
            return ''
    }
}