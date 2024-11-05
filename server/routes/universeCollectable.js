require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {universeCollectables, collectableAttributes} = require('../config/schema');
const express = require('express');
const { eq, and, inArray } = require('drizzle-orm');

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

router.get('/universe-collection/:universe_collection_id', async (req, res) => {
  const { universe_collection_id } = req.params;

  try {
    const collectables = await db
      .select()
      .from(universeCollectables)
      .where(eq(universeCollectables.collection_universe_id, universe_collection_id));

    if (collectables.length === 0) {
      return res.status(404).send({ error: 'No collectables found in this collection' });
    }
    const collectableIds = collectables.map(c => c.universe_collectable_id);

    const attributes = await db
      .select()
      .from(collectableAttributes)
      .where(inArray(collectableAttributes.universe_collectable_id, collectableIds));

    const collectablesWithAttributes = collectables.map(collectable => {
      const relatedAttributes = attributes.filter(
        attribute => attribute.universe_collectable_id === collectable.universe_collectable_id
      );

      return {
        ...collectable,
        attributes: relatedAttributes.map(attr => ({
          collectable_attribute_id: attr.collectable_attribute_id,
          name: attr.name,
          slug: attr.slug,
          value: attr.value,
          is_custom: attr.is_custom
        }))
      };
    });
    res.json(collectablesWithAttributes);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching collectables and attributes' });
  }
});

router.get('/universe-collection-paginated/:universe_collection_id', async (req, res) => {
  const { universe_collection_id } = req.params;
  const { page = 1, itemsPerPage = 8 } = req.query;

  try {
    // Fetch the collectables for the specified universe collection with pagination
    const offset = (page - 1) * itemsPerPage;
    const collectables = await db
      .select()
      .from(universeCollectables)
      .where(eq(universeCollectables.collection_universe_id, universe_collection_id))
      .limit(parseInt(itemsPerPage))
      .offset(offset);

    if (collectables.length === 0) {
      return res.status(404).send({ error: 'No collectables found in this collection' });
    }

    // Get the list of collectable IDs for attribute fetching
    const collectableIds = collectables.map(c => c.universe_collectable_id);

    // Fetch attributes for the paginated collectables
    const attributes = await db
      .select()
      .from(collectableAttributes)
      .where(inArray(collectableAttributes.universe_collectable_id, collectableIds));

    // Map the collectables with their respective attributes
    const collectablesWithAttributes = collectables.map(collectable => {
      const relatedAttributes = attributes.filter(
        attribute => attribute.universe_collectable_id === collectable.universe_collectable_id
      );

      return {
        ...collectable,
        attributes: relatedAttributes.map(attr => ({
          collectable_attribute_id: attr.collectable_attribute_id,
          name: attr.name,
          slug: attr.slug,
          value: attr.value,
          is_custom: attr.is_custom
        }))
      };
    });

    res.json(collectablesWithAttributes);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching collectables and attributes' });
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

router.delete('/delete-universe-collectable', async (req, res) => {
  const { universeCollectableId } = req.body;

  if(!universeCollectableId || isNaN(universeCollectableId))
    return res.status(404).send('No or improper universeCollectableId given');
  console.log("universeCollectableId: ", universeCollectableId);

  try {
    console.log("\nStarting Deletion of universeCollecatble");
    const deletedUniverseCollectable = await db
      .delete(universeCollectables)
      .where(eq(universeCollectableId, universeCollectables.universe_collectable_id))
      .returning();
  
    console.log("deletedUniverseCollectable.length: ", deletedUniverseCollectable.length);
    if(deletedUniverseCollectable.length < 1) {
      console.log("No Collecatble found to delete")
      return res.status(404).send("No Collectable found to delete");
    }
  
    return res.status(200).send("Successfully deleted universeCollectable");
  } catch (error) {
    console.log("Failed to delete collectable");
    console.log(error);
    return res.status(400).send("Error deleting collectable");
  }
});


module.exports = router;