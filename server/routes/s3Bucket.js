const { ManualMaterializedViewBuilder } = require("drizzle-orm/pg-core");
const { db } = require("../config/db");
const { collectionUniverses, users, universeCollectables, collections, collectables } = require('../config/schema');
const { eq, ConsoleLogWriter } = require('drizzle-orm');
const express = require("express");
const fs = require('fs');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

//const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
//router.use(authenticateJWTToken);

const uploadsDir = path.join(__dirname, "../temporary_image_storage");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir); 
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const s3Client = new S3Client({ region: process.env.AWS_REGION });


router.post('/upload', upload.single('singularImage'), async (req, res) => {
    image = req.file;

    if(!image)
        return res.status(404).send({ error: 'No Image Given'});

    const uploadPromises = [];
    const imageUrl = [];

    try {
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
        console.log("imageURL", imageUrl[0]);
        res.status(200).send({ s3ImageUrl: imageUrl[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error uploading Image to S3 Bucket'});
    }
});

module.exports = router;