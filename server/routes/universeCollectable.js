require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {universeCollectables} = require('../config/schema');
const express = require('express');
const {eq} = require('drizzle-orm');

const router = express.Router();

// Universe Collectable CRUD APIs

// Create
router.post('', async (req, res) => {
    const {collectionUniverseId, universeCollectableId, typeId, name, universeCollectablePic} = req.body;

    if (!collectionUniverseId || !collectableType || !typeId || !name || !universeCollectablePic) {
        return res.status(400).send({ error: 'Request body is missing a parameter' });
    }

    try {
        const newItem = await db.insert(universeCollectables).values({
            collection_universe_id: collectionUniverseId,
            collectable_type: collectableType,
            type_id: typeId,
            name: name,
            universeCollectablePic: universeCollectablePic
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
    const allItems = await db.select().from(universeCollectables).execute();
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
      .from(universeCollectables)
      .where(eq(id, universeCollectables.universe_collectable_id))
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
  const { name, universeCollectablePic } = req.body;
  try {
    const result = await db.update(universeCollectables)
      .set({name: name, universeCollectablePic: universeCollectablePic})
      .where(eq(universeCollectables.universe_collectable_id, id)).execute();
    if (result.changes === 0)
    {
      res.status(404).send('User not found');
    }
    res.json({universe_collectable_id_id: id, name, universeCollectablePic});
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
    const deletedItem = await db.delete(universeCollectables)
      .where(eq(id, universeCollectables.universe_collectable_id))
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