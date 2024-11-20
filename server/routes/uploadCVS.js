const { ManualMaterializedViewBuilder } = require("drizzle-orm/pg-core");
const { db } = require("../config/db");
const { collectionUniverses, users, universeCollectables, collectableAttributes, collections, collectables } = require('../config/schema');
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
        console.log(file);
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const cpUpload = upload.fields([
    { name: 'collectableImages', maxCount: 200_000 }
]);

router.post('', cpUpload, async (req, res) => {
    const {
        universeCollectionName,
        universeCollectionDescription,
        urlUniverseThumbnailImage,
        defaultAttributes,
        csvJsonData,
        email,
        isPublished
    } = req.body;

    if (!universeCollectionName || !defaultAttributes || !csvJsonData || !email || !isPublished)
        return res.status(400).send({
            error: `Request body is missing a either universeCollectionName, defaultAttributes, isPublished, email or csvJsonData` });

        const isPublishedBool = isPublished === 'true';

        let collectableImages = [];
        if(req.files['collectableImages'])
            collectableImages = req.files['collectableImages'];


        const parsedDefaultAttributes = JSON.parse(defaultAttributes);
        const parsedCsvJsonData = JSON.parse(csvJsonData);
        const urlCollectableImages = [];

    try {

        // Upload collectableImages to S3 if they exist
        if (collectableImages && collectableImages.length > 0) {
            console.log("uploading images");
            const uploadPromises = collectableImages.map(async file => {
                const fileContent = fs.readFileSync(file.path);
                const uniqueFilename = `${uuidv4()}-${file.originalname}`;
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME, // Use the bucket name directly
                    Key: uniqueFilename, // Use the unique filename
                    Body: fileContent,
                    ContentType: file.mimetype
                };
                return s3Client.send(new PutObjectCommand(params)).then(() => {
                    // Delete the file from the server after uploading to S3
                    const originalName = file.originalname;
                    if(fs.existsSync(file.path))
                        fs.unlinkSync(file.path);

                    const objectUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${uniqueFilename}`;
                    urlCollectableImages.push({ url: objectUrl, originalName: originalName });
                }).catch(error => {
                    console.error(`Error uploading ${file.filename} to S3:`, error);
                    throw new Error(`Failed to upload ${file.filename}`);
                });
            });

            await Promise.all(uploadPromises);
            
            urlCollectableImages.forEach(image => {
                console.log("URL", image.url);
                console.log("Original Name:", image.originalName);
            });
        }

        // Start inserting into tables, now that we have read in the images
        await db.transaction(async (trx) => {
            console.log("\nSearching for user");
            const user = await trx.select(
                {
                    user_id: users.user_id,
                    userName: users.name 
                })
                .from(users)
                .where(eq(users.email, email))
                .execute();

            if (!user || user.length === 0)
                res.status(400).send({ error: "FAILED to find user" });
            const { user_id, userName } = user[0];

            console.log("Creating Universe Collection");
            // Creates the Universe NOT THE COLLECTABLES
            const newUniverseCollection = await trx.insert(collectionUniverses).values({
                name: universeCollectionName,
                created_by: userName,
                default_attributes: parsedDefaultAttributes,
                universe_collection_pic: urlUniverseThumbnailImage || '',
                user_id: user_id,
                description: universeCollectionDescription,
                is_published: isPublishedBool
            }).returning({ collection_universe_id: collectionUniverses.collection_universe_id });
            console.log("New Universe Collection Created");

            const collectionUniverseID = newUniverseCollection[0].collection_universe_id;
            const favoriteAttributes = parsedDefaultAttributes.slice(0,4);

            console.log("updating source_universe value");
            await trx
                .update(collectionUniverses)
                .set({ source_universe: collectionUniverseID })
                .where(eq(collectionUniverseID, collectionUniverses.collection_universe_id))
                .execute();

            console.log("Finished udating source_universe value\n");
            console.log("Creating Collection");
            const customAttributes = [];

            const newCollection = await trx.insert(collections).values({
                name: universeCollectionName,
                user_id: user_id,
                collection_universe_id: collectionUniverseID,
                collection_pic: urlUniverseThumbnailImage,
                custom_attributes: customAttributes,
                favorite_attributes: favoriteAttributes
            }).returning({ collection_id: collections.collection_id});
    
            
            console.log("Collection Created");
            const collectionID = newCollection[0].collection_id;
            
            console.log("Creating Universe Collectables...");

            const universeCollectablesData = [];
            const collectableAttributesData = [];
            const ownedCollectable = [];
            const mappedCollectableImage = [];

            console.log("parsedCsvJsonData: ", parsedCsvJsonData);
            let imageUrl = null
            for (const row of parsedCsvJsonData) {
                const imageObject = urlCollectableImages.find(image => image.originalName === row.image);
                imageUrl = null
                if(imageObject)
                    imageUrl = imageObject.url;
                
                console.log("\nimageUrl: ", imageUrl);
                mappedCollectableImage.push(imageUrl);

                universeCollectablesData.push({
                    collection_universe_id: collectionUniverseID,
                    is_published: isPublishedBool
                });
            }

            // After data is packaged insert data into universeCollectables table
            const newUniverseCollectables = await trx.insert(universeCollectables)
                .values(universeCollectablesData)
                .returning({ universe_collectable_id: universeCollectables.universe_collectable_id });

            // Packages attributes information and then inserts into collectableAttributes
            newUniverseCollectables.forEach((collectable, index) => {
                const universeCollectableID = collectable.universe_collectable_id;
                const row = parsedCsvJsonData[index];
                //collectable_pic: ownedCollectableImage[j]
                // The owned should only be used for the collectables table. 
                for (const [key, value] of Object.entries(row)) {
                    console.log("key: ", key);
                    console.log("value: ", value);
                    if (key !== 'owned' && key !== 'image') {
                        collectableAttributesData.push({
                            collection_universe_id: collectionUniverseID,
                            universe_collectable_id: universeCollectableID,
                            name: key,
                            slug: key.toLowerCase().replace(/\s+/g, '_'),
                            value: value,
                            is_custom: false,
                        });
                    }
                    else if (key == 'owned' && value == 'T') {
                        ownedCollectable.push({
                            collection_id: collectionID,
                            universe_collectable_id: universeCollectableID,
                        });
                    }
                    else if (key == 'image') {
                        console.log("Value: ", value);
                        if(value) {
                            collectableAttributesData.push({
                                collection_universe_id: collectionUniverseID,
                                universe_collectable_id: universeCollectableID,
                                name: key,
                                slug: key.toLowerCase().replace(/\s+/g, '_'),
                                value: mappedCollectableImage[index],
                                is_custom: false,
                            });
                        }
                        else {
                            collectableAttributesData.push({
                                collection_universe_id: collectionUniverseID,
                                universe_collectable_id: universeCollectableID,
                                name: key,
                                slug: key.toLowerCase().replace(/\s+/g, '_'),
                                value: '',
                                is_custom: false,
                            });
                        }
                    }
                }
            });

            console.log("colletableAttributes: ", collectableAttributesData);
            await trx.insert(collectableAttributes).values(collectableAttributesData);

            await trx.insert(collectables).values(ownedCollectable);

            console.log("All data inserted succesfully");
            res.status(200).send({ message: 'Data inserted successfully' });

        }) } catch (error) {
            console.error(error);

            // Cleanup: Delete uploaded files from S3
            const deletePromises = [...urlCollectableImages.map(image => image.url), urlUniverseThumbnailImage].map(url => {
                const filename = url.split('/').pop();
                console.log(filename);
                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: filename
                };
                return s3Client.send(new DeleteObjectCommand(params));
            });
    
            try {
                await Promise.all(deletePromises);
                console.log('Uploaded files deleted from S3 due to error');
            } catch (deleteError) {
                console.error('Error deleting files from S3:', deleteError);
            }
    
            res.status(500).send({ error: 'File upload or database operation failed' });
        }
});

router.post('/existing-universe', cpUpload, async (req, res) => {
    const {
        collectionId,
        collectionUniverseId,
        csvJsonData,
        isPublished
    } = req.body;

    if(!csvJsonData)
        return res.status(404).send('No csvJsonData given');
    if(!collectionUniverseId || isNaN(collectionUniverseId))
        return res.status(404).send("No or Invalid universeCollectionId given");
    console.log("collectionUniverseId: ", collectionUniverseId);
    if(!collectionId || isNaN(collectionId))
        return res.status(404).send("No or Invalid universeCollectionId given");
    if(!isPublished)
        return res.status(404).send('No isPublished given');

    console.log("isPublished: ", isPublished);
    console.log("collectionId: ", collectionId);
    const isPublishedBool = isPublished === 'true';

    let collectableImages = [];
    if(req.files['collectableImages'])
        collectableImages = req.files['collectableImages'];

    const parsedCsvJsonData = JSON.parse(csvJsonData);
    const urlCollectableImages = [];

try {

    // Upload collectableImages to S3 if they exist
    if (collectableImages && collectableImages.length > 0) {
        console.log("uploading images");
        const uploadPromises = collectableImages.map(async file => {
            const fileContent = fs.readFileSync(file.path);
            const uniqueFilename = `${uuidv4()}-${file.originalname}`;
            const params = {
                Bucket: process.env.S3_BUCKET_NAME, // Use the bucket name directly
                Key: uniqueFilename, // Use the unique filename
                Body: fileContent,
                ContentType: file.mimetype
            };
            return s3Client.send(new PutObjectCommand(params)).then(() => {
                // Delete the file from the server after uploading to S3
                const originalName = file.originalname;
                if(fs.existsSync(file.path))
                    fs.unlinkSync(file.path);

                const objectUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${uniqueFilename}`;
                urlCollectableImages.push({ url: objectUrl, originalName: originalName });
            }).catch(error => {
                console.error(`Error uploading ${file.filename} to S3:`, error);
                throw new Error(`Failed to upload ${file.filename}`);
            });
        });

        await Promise.all(uploadPromises);
        
        urlCollectableImages.forEach(image => {
            console.log("URL", image.url);
            console.log("Original Name:", image.originalName);
        });
    }


    await db.transaction(async (trx) => {
         
        console.log("Creating Universe Collectables...");
        const universeCollectablesData = [];
        const collectableAttributesData = [];
        const ownedCollectable = [];
        const mappedCollectableImage = [];

        let imageUrl = null
        for (const row of parsedCsvJsonData) {
            const imageObject = urlCollectableImages.find(image => image.originalName === row.image);
            imageUrl = null
            if(imageObject)
                imageUrl = imageObject.url;
            
            console.log("\nimageUrl: ", imageUrl);
            mappedCollectableImage.push(imageUrl);

            universeCollectablesData.push({
                collection_universe_id: collectionUniverseId,
                is_published: isPublishedBool
            });
        }

        // After data is packaged insert data into universeCollectables table
    
        const newUniverseCollectables = await trx
            .insert(universeCollectables)
            .values(universeCollectablesData)
            .returning({
                universe_collectable_id: universeCollectables.universe_collectable_id,
                isPublished: isPublishedBool
            });
        console.log("Finished creating universe collectables");

        console.log("Creating attributes");
        // Packages attributes information and then inserts into collectableAttributes
        newUniverseCollectables.forEach((collectable, index) => {
            const universeCollectableID = collectable.universe_collectable_id;
            const row = parsedCsvJsonData[index];
            console.log("universeCollectableId: ", universeCollectableID);
            //collectable_pic: ownedCollectableImage[j]
            // The owned should only be used for the collectables table. 
            for (const [key, value] of Object.entries(row)) {
                if (key !== 'owned' && key !== 'image') {
                    collectableAttributesData.push({
                        collection_universe_id: collectionUniverseId,
                        universe_collectable_id: universeCollectableID,
                        name: key,
                        slug: key.toLowerCase().replace(/\s+/g, '_'),
                        value: value,
                        is_custom: false,
                    });
                }
                else if (key == 'owned' && value == 'T') {
                    ownedCollectable.push({
                        collection_id: collectionId,
                        universe_collectable_id: universeCollectableID,
                    });
                }
                else if (key == 'image') {
                    collectableAttributesData.push({
                        collection_universe_id: collectionUniverseId,
                        universe_collectable_id: universeCollectableID,
                        name: key,
                        slug: key.toLowerCase().replace(/\s+/g, '_'),
                        value: mappedCollectableImage[index] || '',
                        is_custom: false,
                    });
                }
            }
        });

        await trx.insert(collectableAttributes).values(collectableAttributesData);

        await trx.insert(collectables).values(ownedCollectable);
        console.log("Finished Creating attributes");
        console.log("All data inserted succesfully");
        res.status(200).send({ message: 'Data inserted successfully' });

    }) } catch (error) {
        console.error(error);

        // Cleanup: Delete uploaded files from S3
        const deletePromises = [...urlCollectableImages.map(image => image.url)].map(url => {
            const filename = url.split('/').pop();
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: filename
            };
            return s3Client.send(new DeleteObjectCommand(params));
        });

        try {
            await Promise.all(deletePromises);
            console.log('Uploaded files deleted from S3 due to error');
        } catch (deleteError) {
            console.error('Error deleting files from S3:', deleteError);
        }

        res.status(500).send({ error: 'File upload or database operation failed' });
    }

});

module.exports = router;