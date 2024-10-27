require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {collectableAttributes} = require('../config/schema');
const express = require('express');
const {eq} = require('drizzle-orm');
const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
router.use(authenticateJWTToken);

// Collection CRUD APIs

function makeSlug(text) {
    // Convert to lowercase
    text = text.toLowerCase();
    
    // Remove special characters (except hyphens)
    text = text.replace(/[^a-z0-9\s-]/g, '');
    
    // Replace spaces with hyphens
    text = text.replace(/\s+/g, '-');
    
    // Remove any leading or trailing hyphens
    text = text.replace(/^-+|-+$/g, '');

    return text;

}

// Create
router.post('', async (req, res) => {
    const {collectionId, collectableId, universeCollectableId, collectionUniverseId, name, value, isCustom} = req.body;

    if (!collectionId || !collectableId || !universeCollectableId || !name || !value || !isCustom || !collectionUniverseId) {
        return res.status(400).send({ error: 'Request body is missing a parameter' });
    }

    const slug = makeSlug(name);

    try {
        const newItem = await db.insert(collectableAttributes).values({
            collection_universe_id: collectionUniverseId,
            collection_id: collectionId,
            collectable_id: collectableId,
            universe_collectable_id: universeCollectableId,
            name: name,
            slug: slug,
            value: value,
            is_custom: isCustom
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
    const allItems = await db.select().from(collectableAttributes).execute();
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
      .from(collectableAttributes)
      .where(eq(id, collectableAttributes.collectable_attribute_id))
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
  const { name, value } = req.body;
  const slug = makeSlug(name);
  try {
    const result = await db.update(collectableAttributes)
      .set({name: name, slug: slug, value: value})
      .where(eq(collectableAttributes.collectable_attribute_id, id)).execute();
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
    const deletedItem = await db.delete(collectableAttributes)
      .where(eq(id, collectableAttributes.collectable_attribute_id))
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