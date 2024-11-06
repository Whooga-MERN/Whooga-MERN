require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const { users } = require('../config/schema');
const express = require('express');
const { eq } = require('drizzle-orm');

const router = express.Router();

// Route to get user information by email
router.get('', async (req, res) => {
    const { user_email } = req.query;
    try {
        console.log("Searching for user:", user_email);
        const user = await db
            .select({ 
                user_id: users.user_id, 
                name: users.name, 
                email: users.email, 
                notification_opt_in: users.notification_opt_in 
            })
            .from(users)
            .where(eq(users.email, user_email))
            .execute();
        
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error fetching user data' });
    }
});

// Route to update notification preference
router.put('/update-opt-in', async (req, res) => {
    const { id, notification_opt_in } = req.body;
    try {
      const result = await db.update(users)
        .set({ notification_opt_in: notification_opt_in })
        .where(eq(users.user_id, id))
        .execute();
      if (result.changes === 0) {
        res.status(404).send('User not found');
      }
      res.json({ user_id: id, notification_opt_in });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error updating notification preference' });
    }
});

// Route to update user name and email
router.put('/update-name-email', async (req, res) => {
    const { id, name, email } = req.body;
    try {
      const result = await db.update(users)
        .set({ name: name, email: email })
        .where(eq(users.user_id, id))
        .execute();
      if (result.changes === 0) {
        res.status(404).send('User not found');
      }
      res.json({ user_id: id, name, email });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error updating user name or email' });
    }
});

module.exports = router;
