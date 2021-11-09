export function getDefaultImageByPetType(petType: string) {
    switch(petType) {
        case 'cat':
            return process.env.AWS_S3_DEFAULT_IMAGE_CAT;
        case 'dog':
            return process.env.AWS_S3_DEFAULT_IMAGE_DOG;
        default:
            return ''
    }
}