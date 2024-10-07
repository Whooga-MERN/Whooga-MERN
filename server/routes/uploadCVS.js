const { db } = require("../config/db");
const { collectionUniverses, users, universeCollectables, collectableAttributes } = require('../config/schema');
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

        console.log("Inserting into collectionUniverses");
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

        console.log("Creating Universe Collectables...");
        try {
            const universeCollectablesData = [];
            const collectableAttributesData = [];

            for (const row of csvJsonData) {
                universeCollectablesData.push({
                    collection_universe_id: collectionUniverseID,
                    name: row.name,
                    universe_collectable_pic: row.image,
                });
            }
            
            // After data is packaged insert data into universeCollectables table
            const newUniverseCollectables = await db.insert(universeCollectables)
                .values(universeCollectablesData)
                .returning({ universe_collectable_id: universeCollectables.universe_collectable_id });

            // Packages attributes information and then inserts into collectableAttributes
            newUniverseCollectables.forEach((collectable, index) => {
                const universeCollectableID = collectable.universe_collectable_id;
                const row = csvJsonData[index];

                for (const [key, value] of Object.entries(row)) {
                    if (key !== 'name' && key !== 'image') {
                        collectableAttributesData.push({
                            universe_collectable_id: universeCollectableID,
                            name: key,
                            slug: key.toLowerCase().replace(/\s+/g, '_'),
                            value: value,
                            is_custom: false,
                        });
                    }
                }
            });

            await db.insert(collectableAttributes).values(collectableAttributesData);

        } catch (error) {
            console.error('Error:', error);
            try {
                const deletedFailedUniverse = await db.delete(collectionUniverses)
                    .where(eq(collectionUniverseID, collectionUniverses.collection_universe_id))
                    .returning();

                if (deletedFailedUniverse.length === 0) {
                    return res.status(404).send({ error: "Failed Universe Not Found" });
                }
                console.log("Failed Universe Deleted");
                return res.status(204).send({ message: 'Failed Universe Deleted' });
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