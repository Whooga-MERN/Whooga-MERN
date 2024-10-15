require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const { universeCollectables, collections, collectionUniverses, users, collectableAttributes } = require('../config/schema');
const express = require('express');
const { eq, ilike, and } = require('drizzle-orm');
// const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
// router.use(authenticateJWTToken);

// Universe Collectable Search APIs

router.get('', async (req, res) => {
    const {collectionUniverseId, attributeToSearch, searchTerm} = req.query;

    if (!searchTerm || !attributeToSearch || !collectionUniverseId) {
        return res.status(400).send({error: 'Missing a request parameter'});
    }

    const items = await db
        .select()
        .from(universeCollectables)
        .innerJoin(
            collectableAttributes,
            eq(universeCollectables.universe_collectable_id, collectableAttributes.universe_collectable_id)
        )
        .where(
            and(
                eq(universeCollectables.collection_universe_id, collectionUniverseId),
                eq(collectableAttributes.slug, attributeToSearch),
                ilike(collectableAttributes.value, `%${searchTerm}%`)
            )
        );
    
    res.json(items);

});

module.exports = router;