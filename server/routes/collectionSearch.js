require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const {collectionUniverses} = require('../config/schema');
const express = require('express');
const { eq, ilike, and } = require('drizzle-orm');
// const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
// router.use(authenticateJWTToken);

// Collection Search APIs

router.get('', async (req, res) => {
    const {userId, searchTerm} = req.body;

    if (!userId || !searchTerm) {
        return res.status(400).send({error: 'Missing a request parameter'});
    }

    const items = await db
        .select()
        .from(collectionUniverses)
        .where(
            and(
                eq(collectionUniverses.user_id, userId),
                ilike(collectionUniverses.name, `%${searchTerm}%`)
            )
        );
    
    res.json(items);

});

module.exports = router;
