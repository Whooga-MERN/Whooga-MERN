require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const {collectables, collectionUniverses, universeCollectables, collectableAttributes, collections} = require('../config/schema');
const express = require('express');
const { eq, inArray } = require('drizzle-orm');
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

module.exports = router;