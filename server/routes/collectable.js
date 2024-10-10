require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {collectables, collectionUniverses, universeCollectables, collectableAttributes} = require('../config/schema');
const express = require('express');
const {eq} = require('drizzle-orm');

const router = express.Router();

// Collectable CRUD APIs

router.put('', async(req, res) => {

  const {collection_id, attributes_json, isWishlist, universe_collectable_pic} = req.body;

  /* attributes_json should have:
  column for owned
  column for image
  column for each default attribute + custom attribute

  */
  if(!collection_id) {
    console.log("Missing collection_id");
    return res.status(404).send({ error: "Missing collection_id"});
  }

  try {
    const fetchUniverseCollectionId = await db
    .select({universe_collection_id: collectionUniverses.collection_universe_id})
    .from(collectionUniverses)
    .where(collectionUniverses.collection_id, collection_id)
    .execute();

    if(!fetchUniverseCollectionId) {
      console.log("Could not find Universe Collection associated with collection");
      return res.status(404).send({ error: "Could not find Universe Collection associated with collection"});
    }

    const collection_universe_id = fetchUniverseCollectionId[0].universe_collection_id;

    const newUniverseCollectable = await db
    .insert(universeCollectables)
    .values({
      collection_universe_id: collection_universe_id,
      universe_collectable_pic: universe_collectable_pic,
    })
    .returning({ universe_collectable_id: universeCollectables.universe_collectable_id })
    .execute();

    const universe_collectable_id = newUniverseCollectable[0].universe_collectable_id;

    

  } catch (error) {
    
  }

});

// Create
router.post('', async (req, res) => {
    const {collectionId, universeCollectableId, collectablePic} = req.body;

    if (!collectionId || !universeCollectableId) {
        return res.status(400).send({ error: 'Request body is missing a parameter' });
    }

    try {
        const newItem = await db.insert(collectables).values({
            collection_id: collectionId,
            universe_collectable_id: universeCollectableId,
            collectablePic: collectablePic
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
    const allItems = await db.select().from(collectables).execute();
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
      .from(collectables)
      .where(eq(id, collectables.collectable_id))
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

// READ (All items from a universe collection)
router.get('/universe_collection/:universe_collection_id', async (req, res) => {
  const { universe_collection_id } = req.params;

  try {
    const allItems = await db.select()
      .from(collectables)
      .where(eq(universe_collection_id, collectables.universe_collection_id))
      .execute();

    if (item.length === 0) {
      return res.status(404).send({ error: 'Items not found' });
    }
    res.json(allItems);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching item' });
  }
});

// READ (All items from a collection)
router.get('/collection/:collection_id', async (req, res) => {
  const { collection_id } = req.params;

  try {
    const allItems = await db.select()
      .from(collectables)
      .where(eq(collection_id, collectables.collection_id))
      .execute();


    res.json(allItems);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching item' });
  }
})

// UPDATE
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { collectablePic } = req.body;
  try {
    const result = await db.update(collectables)
      .set({collectablePic: collectablePic})
      .where(eq(collectables.collectable_id, id)).execute();
    if (result.changes === 0)
    {
      res.status(404).send('User not found');
    }
    res.json({collectable_id: id, collectablePic});
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
    const deletedItem = await db.delete(collectables)
      .where(eq(id, collectables.collectable_id))
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