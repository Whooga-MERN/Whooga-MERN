require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const {collectionUniverses, collections} = require('../config/schema');
const express = require('express');
const { eq, ilike, and, sql } = require('drizzle-orm');
// const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
// router.use(authenticateJWTToken);

// Collection Search APIs

router.get('', async (req, res) => {
    const {userId, searchTerm} = req.query;

    if (!userId || !searchTerm) {
        return res.status(400).send({error: 'Missing a request parameter'});
    }

    try {
        const items = await db
        .select()
        .from(collections)
        .innerJoin(
            collectionUniverses,
            eq(collections.collection_universe_id, collectionUniverses.collection_universe_id)
        )
        .where(
            and(
                eq(collections.user_id, userId),
                sql`similarity(${collectionUniverses.name}, ${searchTerm}) > 0.3`
            )
        )
        .orderBy(sql`similarity(${collectionUniverses.name}, ${searchTerm}) DESC`)
        .execute();

        res.status(200).json(items);

    } catch (error) {
        res.status(400).send("Error searching for collections");
    }    
});

module.exports = router;

