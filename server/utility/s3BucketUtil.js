const fs = require('fs');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({ region: process.env.AWS_REGION });

async function createS3File(image) {
    const uploadPromises = [];
    const imageUrl = [];

    const fileContent = fs.readFileSync(image.path);
    const uniqueFilename = `${uuidv4()}-${image.originalname}`;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uniqueFilename,
        Body: fileContent,
        ContentType: image.mimetype
    };

    uploadPromises.push(s3Client.send(new PutObjectCommand(params)).then(() => {
        // Delete the file from the server after uploading to S3
        console.log(image.path);
            if(fs.existsSync(image.path))
                fs.unlinkSync(image.path);

        const objectUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${uniqueFilename}`;
        console.log("the object url", objectUrl);
        imageUrl.push(objectUrl); // Store the URL
    }).catch(error => {
        console.error(`Error uploading ${image.filename} to S3:`, error);
        throw new Error(`Failed to upload ${image.filename}`);
    }));

    await Promise.all(uploadPromises);
    console.log("imageUrl[0]: ", imageUrl[0]);
    return imageUrl[0];
}

async function deleteSingularS3File(imageUrl) {
// Cleanup: Delete uploaded files from S3
    const filename = imageUrl.split('/').pop();
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filename
    };

    try {
        await s3Client.send(new DeleteObjectCommand(params));
        console.log(`File ${filename} deleted from S3`);
    } catch (error) {
        console.error(('Error deleting file from S3:', deleteError));
    }
}

module.exports = {
    createS3File,
    deleteSingularS3File
};