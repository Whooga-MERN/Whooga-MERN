require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {collections, collectionUniverses} = require('../config/schema');
const express = require('express');
const {eq} = require('drizzle-orm');
const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
router.use(authenticateJWTToken);

// Collection Universe CRUD APIs

// Create
router.post('', async (req, res) => {
    const {name, createdBy, defaultAttributes, universeCollectionPic} = req.body;

    if (!name || !createdBy || !defaultAttributes) {
        return res.status(400).send({ error: 'Request body is missing a parameter' });
    }

    try {


        const newItem = await db.insert(collectionUniverses).values({
          
            name: name,
            created_by: createdBy,
            default_attributes: defaultAttributes,
            universeCollectionPic: universeCollectionPic,
        }).returning();

        res.status(201).json(newItem);
    } catch (error){
        console.error(error);
        res.status(500).send({ error: 'Error creating item' });
    }

});

// READ (All items)
router.get('', async (req, res) => {
  try {
    const allItems = await db.select().from(collectionUniverses).execute();
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
      .from(collectionUniverses)
      .where(eq(id, collectionUniverses.collection_universe_id))
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

// READ (All collection universes from a user)
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const allItems = await db.select()
      .from(collectionUniverses)
      .where(eq(user_id, collectionUniverses.user_id))
      .execute();
    res.json(allItems);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching items' });
  }
})

// UPDATE
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, defaultAttributes, universeCollectionPic } = req.body;
  try {
    const result = await db.update(collectionUniverses)
      .set({name: name, default_attributes: defaultAttributes, universeCollectionPic: universeCollectionPic})
      .where(eq(collectionUniverses.collection_universe_id, id)).execute();
    if (result.changes === 0)
    {
      res.status(404).send('User not found');
    }
    res.json({collection_universe_id: id, name, defaultAttributes, universeCollectionPic});
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
    const deletedItem = await db.delete(collectionUniverses)
      .where(eq(id, collectionUniverses.collection_universe_id))
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
