const { db } = require("../config/db");
const {collectionUniverses, users, universeCollectables} = require('../config/schema');
const {eq} = require('drizzle-orm');
const express = require("express");
const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
router.use(authenticateJWTToken);
/* I need to:  
THIS IS JUST FOR UPLOADING THE CSV STAY ON FOCUS
So I need to parse the json provided from the csv to upload into database
Need to use tables: universeCollectables & collectableAttributes

we need the following values:
Collectables table:
1. collection_universe_id
2. collectable_type
3. type_id ????
4. name ???? why are we doing this when collectable attributes is already doing this
5. universeCollectablePic

collectableAttributes table
1. collection_id
2. collectable_id
3. universe_collectable_id
4. name
5. slug
6. value
8 is_custom 
*/
router.post('', async (req, res) => {
    const {universeCollectionName, universeCollectionImage, universeCollectionDescription,
         defaultAttributes, csvJsonData, email} = req.body;

    if(!collectionName || !defaultAttributes || csvJsonData) 
        return res.status(400).send({ error: `Request body is missing a either collectionName,
    defaultAttributes, or csvJsonData` });


    try {

        const user= await db.select('name', 'user_id').from(users).where( { email: email}).first();

        // Creates the Universe NOT THE COLLECTABLES
        const newUniverseCollection = await db.insert(collectionUniverses).values({
            name: universeCollectionName,
            created_by: user.name,
            default_attributes: defaultAttributes,
            universe_collection_pic: universeCollectionImage,
            user_id: user.user_id,  
            description: universeCollectionDescription,
        }).returning();


        const newUniverseCollectables = await db.insert(universeCollectables).values({

        })

    } catch (error) {

    }
});