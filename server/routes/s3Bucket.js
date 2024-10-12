const { ManualMaterializedViewBuilder } = require("drizzle-orm/pg-core");
const { db } = require("../config/db");
const { collectionUniverses, users, universeCollectables, collections, collectables } = require('../config/schema');
const { eq, ConsoleLogWriter } = require('drizzle-orm');
const express = require("express");
const fs = require('fs');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const { createS3File } = require('../utility/s3BucketUtil');


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

    try {
        const imageUrl = await createS3File(image)
        res.status(200).send({ s3ImageUrl: imageUrl});
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error uploading Image to S3 Bucket'});
    }
});

module.exports = router;