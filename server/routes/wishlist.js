const { collections, wishlist } = require('../config/schema');
const express = require('express');
const { eq, and } = require('drizzle-orm');
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

module.exports = router;