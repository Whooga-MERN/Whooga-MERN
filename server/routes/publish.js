require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const {collectables, collectionUniverses, universeCollectables, collectableAttributes, collections} = require('../config/schema');
const express = require('express');
const { eq, inArray, and, ilike } = require('drizzle-orm');
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

router.put('/publish-custom-attributes', async (req, res) => {
    const { collectionUniverseId, customAttributesPublish } = req.body;

    if(!collectionUniverseId || isNaN(collectionUniverseId)) {
        console.log("No or improper collectionUniverseId");
        return res.status(404).send("No or improper collectionUniverseId");
    }
    if(!customAttributesPublish || customAttributesPublish < 1) {
        console.log("No or improper customAttributesPublish");
        return res.status(404).send("No or improper customAttributesPublish");
    }

    //fetch default attributes
    console.log("Fetching default attributes");
    const universeDefaultAttributesQuery = await db
        .select(
            {
                defaulAttributes: collectionUniverses.default_attributes,
                customAttributes: collections.custom_attributes
            }
        )
        .from(collectionUniverses)
        .innerJoin(collections, eq(collections.collection_universe_id, collectionUniverses.collection_universe_id))
        .where(eq(collectionUniverseId, collectionUniverses.collection_universe_id))
        .execute();

    let defaulAttributes;
    let customAttributes; 
    try {
        defaulAttributes = universeDefaultAttributesQuery[0].defaulAttributes;
        console.log("defaultAttributes: ", defaulAttributes);
        customAttributes = universeDefaultAttributesQuery[0].customAttributes;
        console.log("customAttributes: ", customAttributes);
    } catch (error) {
        console.log("Failed to grab default attributes");
        console.log(error);
    }
    console.log("Finished Fetching default attributes\n");

    const updatedCustomAttributes = customAttributes.filter(attr => !customAttributesPublish.includes(attr));
    console.log("updatedCustomAttributes: ", updatedCustomAttributes);

    await db.transaction(async (trx) => {
        console.log("\nUpdating custom attributes in collections");
        await trx
            .update(collections)
            .set({ custom_attributes: updatedCustomAttributes})
            .where(eq(collectionUniverseId, collections.collection_universe_id))
            .execute();

        console.log("Finished Updating custom attributes in collections\n");

        console.log("Updating is_custom for the published custom_attributes in collectableAttributes");
        await trx
            .update(collectableAttributes)
            .set({ is_custom: false })
            .where(
                and(
                    eq(collectionUniverseId, collectableAttributes.collection_universe_id)),
                    inArray(customAttributesPublish, collectableAttributes.name)
                )   
            .execute();
        
        console.log("Finished updating custom attributes for collectableAttributes\n");
        res.status(200).send("Succesfully published custom attributes");

    });
    
});

router.get('/display-published-universes', async (req, res) => {
    const {searchTerm} = req.query;

    if(!searchTerm) {
        console.log("No searchTerm given");
        return res.status(404).send("No searchTerm given");
    }
    console.log("searchTerm: ", searchTerm);

    try {
        console.log("Fetching published universes");
        const publishedUniverses = await db
            .select()
            .from(collectionUniverses)
            .where(
                and(
                    eq(collectionUniverses.is_published, true),
                    ilike(collectionUniverses.name, `%${searchTerm}%`)
                )
            )
            .execute();

        console.log("Finished Fetching published universes");
        console.log(publishedUniverses);
        return res.status(200).json(publishedUniverses);   
    } catch (error) {
        console.log("Failed to Fetch collection Universes");
        console.log(error);
        return res.status(400).send("Failed to fetch collection universes");
    }
    
});

module.exports = router;