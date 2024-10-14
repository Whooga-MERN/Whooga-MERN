require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const { collectables, collections, collectionUniverses, users, collectableAttributes } = require('../config/schema');
const express = require('express');
const { eq, ilike, and } = require('drizzle-orm');
// const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
// router.use(authenticateJWTToken);

// Collectable Search APIs

router.get('', async (req, res) => {
    const {collectionId, attributeToSearch, searchTerm} = req.body;

    if (!searchTerm || !attributeToSearch || !collectionId) {
        return res.status(400).send({error: 'Missing a request parameter'});
    }

    const items = await db
        .select()
        .from(collectables)
        .innerJoin(
            collectableAttributes, 
            and(
                eq(collectables.collectable_id, collectableAttributes.collectable_id),
                eq(collectables.collection_id, collectableAttributes.collection_id)
            )
        )
        .where(
            and(
                eq(collectableAttributes.collection_id, collectionId),
                eq(collectableAttributes.slug, attributeToSearch),
                ilike(collectableAttributes.value, `%${searchTerm}%`)
            )
        );
    
    res.json(items);

});

module.exports = router;