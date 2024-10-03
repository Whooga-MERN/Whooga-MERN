const { db } = require("../config/db");
const {collectionUniverses, users, universeCollectables, collectableAttributes} = require('../config/schema');
const {eq} = require('drizzle-orm');
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

    if(!universeCollectionName || !defaultAttributes || !csvJsonData || !email) 
        return res.status(400).send({ error: `Request body is missing a either universeCollectionName,
    defaultAttributes, or csvJsonData` });


    try {
        console.log("Searching for user");
        const user = await db.select({user_id: users.user_id, userName: users.name}).from(users).where(eq( users.email, email )).execute();
        
        if(!user || user.length === 0)
            res.status(400).send({ error: "FAILED to find user" });
        console.log("user found");
        const { user_id, userName } = user[0];
        console.log(user_id);
        console.log(userName);

        console.log("Inserting into collectionUniverses");
        // Creates the Universe NOT THE COLLECTABLES
        const newUniverseCollection = await db.insert(collectionUniverses).values({
            name: universeCollectionName,
            created_by: userName,
            default_attributes: defaultAttributes,
            universe_collection_pic: universeCollectionImage,
            user_id: user_id,  
            description: universeCollectionDescription,
        }).returning( {collection_universe_id: collectionUniverses.collection_universe_id});
        console.log("New Universe Collection Created");

        const collectionUniverseID = newUniverseCollection[0].collection_universe_id;

        console.log("Creating Universe Collectables...");
        try {
            for (const row of csvJsonData) {
                const [newUniverseCollectables] = await db.insert(universeCollectables).values({
                    collection_universe_id: collectionUniverseID,
                    name: row.name,
                    universe_collectable_pic: row.image,
                }).returning( { universe_collectable_id: universeCollectables.universe_collectable_id } );
    
                const universeCollectableID = newUniverseCollectables.universe_collectable_id; 
    
                for (const [key, value] of Object.entries(row)) {
                    if (key !== 'name' && key !== 'image') {
                        await db.insert(collectableAttributes).values({
                            universe_collectable_id: universeCollectableID,
                            name: key,
                            slug: key.toLowerCase().replace(/\s+/g, '_'),
                            value: value,
                            is_custom: true,
                        });
                    }
                }
            }   
        } catch (error) {
            try{
                const deletedFailedUniverse = await db.delete(collectionUniverses)
                .where(eq(collectionUniverseID, collectionUniverses.collection_universe_id))
                .returning();

                if(deletedFailedUniverse.length === 0) {
                    return res.status(404).send({ error: "Failed Universe Not Found"});
                }
                console.log("Failed Universe Deleted")
                return res.status(204).send( { message: 'Failed Universe Deleted' });
            } catch {
                return res.status(500).status({ error: 'Error deleting item'});
            }
        }

        console.log("All data inserted succesfully");
        res.status(200).send({ message: 'Data inserted successfully' });

    } catch (error) {
        console.error('Error', error);
        res.status(500).send({ error: 'Bulk Upload FAIL'});
    }
});

module.exports = router;