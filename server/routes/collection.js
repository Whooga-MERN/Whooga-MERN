require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {collections, collectionUniverses, users} = require('../config/schema');
const express = require('express');
const {eq} = require('drizzle-orm');
const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
router.use(authenticateJWTToken);

// Collection CRUD APIs

// Create
router.post('', async (req, res) => {
    const {userId, collectionUniverseId, customAttributes, collectionPic} = req.body;

    if (!userId || !collectionUniverseId || !customAttributes) {
        return res.status(400).send({ error: 'Request body is missing a parameter' });
    }

    try {
        const newItem = await db.insert(collections).values({
            user_id: userId,
            collection_universe_id: collectionUniverseId,
            custom_attributes: customAttributes,
            collectionPic: collectionPic,
        }).returning();

        res.status(201).json(newItem);
    } catch (error){
        console.error(error);
        res.status(500).send({ error: 'Error creating item' });
    }

});

// READ (All items)
router.get('', async (req, res) => {
  const {
    user_id,
  } = req.body;

  try {
    const allItems = await db.select().from(collections).where(eq(collections.user_id, user_id)).execute();
    res.json(allItems);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching items' });
  }
});

// READ (Single item)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const item = await db.select()
      .from(collections)
      .where(eq(id, collections.collection_id))
      .execute();

    if (item.length === 0) {
      return res.status(404).send({ error: 'Item not found' });
    }
    res.json(item[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching item' });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { customAttributes, collectionPic } = req.body;
  try {
    const result = await db.update(collections)
      .set({custom_attributes: customAttributes, collectionPic: collectionPic})
      .where(eq(collections.collection_id, id)).execute();
    if (result.changes === 0)
    {
      res.status(404).send('User not found');
    }
    res.json({collection_id: id, customAttributes, collectionPic});
  }
  catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching item' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await db.delete(collections)
      .where(eq(id, collections.collection_id))
      .returning(); // Fetch the deleted item

    if (deletedItem.length === 0) {
      return res.status(404).send({ error: 'Item not found' });
    }
    res.status(204).send(); // No content on successful delete
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error deleting item' });
  }
});

module.exports = router;