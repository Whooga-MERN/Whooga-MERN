const { db } = require("../config/db");
const { collectionUniverses, users, universeCollectables, collectableAttributes, collections, collectables } = require('../config/schema');
const { eq } = require('drizzle-orm');
const express = require("express");
//const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
//router.use(authenticateJWTToken);

router.post('', async (req, res) => {
    const {
        universeCollectionName,
        universeCollectionImage,
        universeCollectionDescription,
        defaultAttributes,
        csvJsonData,
        email
    } = req.body;

    if (!universeCollectionName || !defaultAttributes || !csvJsonData || !email)
        return res.status(400).send({
            error: `Request body is missing a either universeCollectionName,
    defaultAttributes, or csvJsonData` });


    try {
        console.log("Searching for user");
        const user = await db.select({ user_id: users.user_id, userName: users.name }).from(users).where(eq(users.email, email)).execute();

        if (!user || user.length === 0)
            res.status(400).send({ error: "FAILED to find user" });
        const { user_id, userName } = user[0];

        console.log("Creating Universe Collection");
        // Creates the Universe NOT THE COLLECTABLES
        const newUniverseCollection = await db.insert(collectionUniverses).values({
            name: universeCollectionName,
            created_by: userName,
            default_attributes: defaultAttributes,
            universe_collection_pic: universeCollectionImage,
            user_id: user_id,
            description: universeCollectionDescription,
        }).returning({ collection_universe_id: collectionUniverses.collection_universe_id });
        console.log("New Universe Collection Created");

        const collectionUniverseID = newUniverseCollection[0].collection_universe_id;
        const favoriteAttributes = defaultAttributes.slice(0,4);

        console.log("Creating Collection");
  
        const newCollection = await db.insert(collections).values({
            name: universeCollectionName,
            user_id: user_id,
            collection_universe_id: collectionUniverseID,
            collection_pic: universeCollectionImage,
            favorite_attributes: favoriteAttributes
        }).returning({ collection_id: collections.collection_id});
 
        
        console.log("Collection Created");
        const collectionID = newCollection[0].collection_id;
        
        console.log("Creating Universe Collectables...");
        try {
            const universeCollectablesData = [];
            const collectableAttributesData = [];
            const ownedCollectable = [];
            const ownedCollectableImage = [];

            for (const row of csvJsonData) {
                universeCollectablesData.push({
                    collection_universe_id: collectionUniverseID,
                    universe_collectable_pic: row.image,
                });
                ownedCollectableImage.push(row.image);
            }
            
            // After data is packaged insert data into universeCollectables table
            const newUniverseCollectables = await db.insert(universeCollectables)
                .values(universeCollectablesData)
                .returning({ universe_collectable_id: universeCollectables.universe_collectable_id });

            // Packages attributes information and then inserts into collectableAttributes
            newUniverseCollectables.forEach((collectable, index) => {
                const universeCollectableID = collectable.universe_collectable_id;
                const row = csvJsonData[index];

                // The owned should only be used for the collectables table. 
                for (const [key, value] of Object.entries(row)) {
                    if (key !== 'owned' && key !== 'image') {
                        collectableAttributesData.push({
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
                            collectable_pic: universeCollectionImage[index]
                        })
                    }
                }
            });

            await db.insert(collectableAttributes).values(collectableAttributesData);

            await db.insert(collectables).values(ownedCollectable);

        } catch (error) {
            console.error('Error:', error);
            try {
                const deletedFailedUniverse = await db.delete(collectionUniverses)
                    .where(eq(collectionUniverseID, collectionUniverses.collection_universe_id))
                    .returning();

                if (deletedFailedUniverse.length === 0) {
                    return res.status(404).send({ error: "Failed to create attributes and collectables... Attemping to delete universe, universe not found" });
                }
                console.log("Failed Universe Deleted");
                return res.status(204).send({ message: 'Failed to create attributes and collectables, Deleted Universe' });
            } catch (deleteError) {
                console.error('Error during deletion:', deleteError);
                if (!res.headersSent) {
                    return res.status(500).send({ error: 'Internal Server Error' });
                }
            }
        }

        console.log("All data inserted succesfully");
        res.status(200).send({ message: 'Data inserted successfully' });

    } catch (error) {
        console.error('Error', error);
        res.status(500).send({ error: 'Bulk Upload FAIL' });
    }
});

module.exports = router;