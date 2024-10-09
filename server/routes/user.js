require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const { users } = require('../config/schema');
const express = require('express');
const { eq } = require('drizzle-orm');
//const { authenticateJWTToken } = require("../middleware/verifyJWT");
//router.use(authenticateJWTToken);
const router = express.Router();

router.get('', async (req, res) => {
    const { user_email } = req.query;
    try {
        console.log("Searching for user:", user_email);
        const user = await db
            .select({ user_id: users.user_id })
            .from(users)
            .where(eq(users.email, user_email))
            .execute();
            
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error fetching user_id by email' });
    }
})

module.exports = router;