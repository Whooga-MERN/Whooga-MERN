const { collections, wishlist, collectableAttributes } = require('../config/schema');
const express = require('express');
const { eq, and, or, isNull, inArray } = require('drizzle-orm');
const { db } = require('../config/db');

const router = express.Router();

router.post('/add-wishlist', async (req, res) => {
    const {collection_id, universe_collectable_id} = req.body;

    if(!collection_id, !universe_collectable_id){
        console.log("collection_id: ", collection_id );
        console.log("universe_collectable_id: ", universe_collectable_id);
        return res.status(404).send({ error: 'Not Given either collection_id or universe_collectable_id'});
    }

    try {
        console.log("query for collection_universe_id");
        const fetchCollectionUniverseId = await db.
        select({collection_universe_id: collections.collection_universe_id})
        .from(collections)
        .where(eq(collections.collection_id, collection_id))
        .execute();
    
        const collection_universe_id = fetchCollectionUniverseId[0].collection_universe_id;
    
        console.log(collection_universe_id);
        console.log("Starting insert into wishlist table");
        const postWishlist = await db
        .insert(wishlist)
        .values({
            collection_id: collection_id,
            collection_universe_id: collection_universe_id,
            universe_collectable_id: universe_collectable_id
        })
        .execute();
        console.log(postWishlist);
        return res.status(200).send({ message: 'wishlist item added successfully' });
        // if (postWishlist.length > 0) {
        //     return res.status(200).send({ message: 'wishlist item added successfully' });
        // } else {
        //     return res.status(500).send({ error: 'Failed to add to wishlist' });
        // }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return res.status(500).send({ error: 'Internal server error' });
    }
});

router.delete('/remove-wishlist', async (req, res) => {
    const {collection_id, universe_collectable_id} = req.body;

    if(!collection_id, !universe_collectable_id){
        console.log("collection_id: ", collection_id );
        console.log("universe_collectable_id: ", universe_collectable_id);
        return res.status(404).send({ error: 'Not Given either collection_id or universe_collectable_id'});
    }

    try {

        console.log("deleting from wishlist...");
        await db
        .delete(wishlist)
        .where(and(
            eq(wishlist.collection_id, collection_id),
            eq(wishlist.universe_collectable_id, universe_collectable_id)
        ))
        .execute();

        console.log("Deleted from wishlist");
        return res.status(200).send('Successfully deleted from wishlist');
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: "Failed to delete from wishlist:\n"});
    }
});

router.get('/wishlisted-collectables/:collection_id', async (req, res) => {
    const { collection_id } = req.params;
    console.log("collection_id: ", collection_id);

    // I need to grab all universe collectables and then their attributes

    try {

        console.log("Searching for wishlisted Collectables...\n");
        const wishlistedCollectables = await db
        .select({ universe_collectable_id: wishlist.universe_collectable_id})
        .from(wishlist)
        .where(eq(collection_id, wishlist.collection_id))
        .execute();

        const universeCollectableIds = wishlistedCollectables.map(item => item.universe_collectable_id);

        if(universeCollectableIds.length === 0) {
            return res.status(404).send({ error: 'No wishlsited collectables found' });
        }
        console.log(universeCollectableIds);

        const collectableAttributesResult = await db
            .select()
            .from(collectableAttributes)
            .where(
                and(
                    or(eq(collectableAttributes.collection_id, collection_id), isNull(collectableAttributes.collection_id)),
                    inArray(collectableAttributes.universe_collectable_id, universeCollectableIds)
                )
            )
            .execute();
        
        console.log(collectableAttributesResult);

        res.status(400).json({
            universeCollectableIds,
            collectableAttributesResult
        });
    } catch (error) {
        console.error("Error fetching wishlisted collectables:", error);
        res.status(500).send({ error: 'Internal server error' });
    }
});



module.exports = router;