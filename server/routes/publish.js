require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const {collectables, collectionUniverses, universeCollectables, collectableAttributes, collections} = require('../config/schema');
const express = require('express');
const { eq, inArray, and } = require('drizzle-orm');
// const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
// router.use(authenticateJWTToken);

router.put('/publish-collectables', async (req, res) => {
    const { universeCollectableIds, isPublish } = req.body;

    if(!universeCollectables || universeCollectables.length < 1) {
        console.log("universeCollectables not or improperly provided");
        return res.status(404).send("universeCollectables not or improperly provided");
    }
    if(!isPublish) {
        console.log("isPublish not or improperly provided");
        return res.status(404).send("isPublish not or improperly provided");
    }
    const isPublishBool = isPublish === "true";
    console.log("isPublishBool: ", isPublishBool);

    try {
        console.log("Publishing universe collectables");
        const publishedCollectables = await db
            .update(universeCollectables)
            .set({ is_published: isPublishBool })
            .where(inArray(universeCollectables.universe_collectable_id, universeCollectableIds))
            .execute()

        console.log("Finished publishing universe collectables");
        res.status(200).send("Successfully published universal collectables");
    } catch (error) {
        console.log(error);
        res.status(400).send("Failed to publish universe collectables");
    }
});

router.put('/publish-universe', async (req, res) => {
    const { collectionUniverseId, isPublished } = req.body;

    if(!collectionUniverseId || isNaN(collectionUniverseId)) {
        console.log("collectionUniverseId not or improperly provided");
        res.status(404).send("collectionUniverseId not or improperly provided");
    }
    console.log("collectionUniverseId: ", collectionUniverseId);
    const isPublishedBool = isPublished === "true";

    try {
        let publishedUniverseCollectable;
        if(isPublishedBool)
        {
            publishedUniverseCollectable = await db
                .select({ universe_collectable_id: universeCollectables.universe_collectable_id })
                .from(universeCollectables)
                .where(and(
                    eq(universeCollectables.is_published, isPublishedBool),
                    eq(universeCollectables.collection_universe_id, collectionUniverseId)
                ))
                .limit(1)
                .execute();            
        }


        if(isPublishedBool) {
            console.log("publishedUniverseCollectable.length: ", publishedUniverseCollectable.length);
            if(publishedUniverseCollectable.length > 0) {
                await db
                    .update(collectionUniverses)
                    .set({ is_published: isPublishedBool })
                    .where(eq(collectionUniverses.collection_universe_id, collectionUniverseId))
                    .execute();

                    console.log("Successfully changed is_published for collection universe")
                    return res.status(200).send("Succesfully changed is_published for collection universe");
            }
            else {
                return res.status(404).send("FAILED to publish, No published universe collectables in the universe");
            }
        }

        await db
        .update(collectionUniverses)
        .set({ is_published: isPublishedBool })
        .where(eq(collectionUniverses.collection_universe_id, collectionUniverseId))
        .execute();

        console.log("Successfully published collection universe")
        res.status(200).send("Succesfully published collection universe");

    } catch (error) {
        console.log(error)
        res.status(400).send("FAILED to publish collection universe");
    }
})

module.exports = router;