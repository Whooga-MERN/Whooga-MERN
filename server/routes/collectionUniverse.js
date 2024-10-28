require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {collections, collectionUniverses, users, universeCollectables, collectableAttributes} = require('../config/schema');
const express = require('express');
const {eq, and, inArray} = require('drizzle-orm');
//const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
//router.use(authenticateJWTToken);


router.post('/copy-universe', async (req, res) => {
  const { collectionUniverseId, userEmail } = req.body;

  if(!collectionUniverseId || isNaN(collectionUniverseId)) {
    console.log("None or invalid collectionUniverseId given");
    return res.status(404).send("None or invalid collectionUniverseId given");
  }

  if(!userEmail) {
    console.log("No userEmail provided");
    return res.status(404).send("No userEmail provided");
  }

  // I need to grab all universeCollectables that are published
  // For attributes I need to: Find non-custom attribute rows for ith universeCollectable

  try {
    console.log("Finding user's name");
    const userQuery = await db
      .select(
        { 
          name: users.name,
          userId: users.user_id
        }
      )
      .from(users)
      .where(eq(userEmail, users.email))
      .execute();
  
    const userName = userQuery[0].name;
    const userId = userQuery[0].userId;
    console.log("Found user's name");
    console.log("userName: ", userName);
  
    // Grab creator universe data
    console.log("finding default attributes");
    const creatorUniverseQuery = await db
      .select(
        {
          collectionName: collectionUniverses.name, 
          defaultAttributes: collectionUniverses.default_attributes,
          universeCollectionPic: collectionUniverses.universe_collection_pic,
          description: collectionUniverses.description,
        }
      )
      .from(collectionUniverses)
      .where(eq(collectionUniverseId, collectionUniverses.collection_universe_id))
      .execute();
    console.log("found default attributes\n");
  
    let attributesLength = 0;
    let collectionName;
    let defaultAttributes;
    let universeCollectionPic;
    let description;
  
    try {
      collectionName = creatorUniverseQuery[0].collectionName;
      defaultAttributes = creatorUniverseQuery[0].defaultAttributes;
      universeCollectionPic = creatorUniverseQuery[0].universeCollectionPic;
      description = creatorUniverseQuery[0].description;
      attributesLength = defaultAttributes.length;
    } catch (error) {
      console.log("Error finding attributesLength");
      console.log(error);
      return res.status(400).send("Error finding attributesLength");
    }
    console.log("attributesLength: ", attributesLength); //if 4 attributes then prints 4
  
    // Create copy collection universe
    await db.transaction(async (trx) => {
      console.log("Creating collectionUniverse");
      const newUniverseQuery = await trx
        .insert(collectionUniverses)
        .values({
          name: collectionName,
          created_by: userName,
          default_attributes: defaultAttributes,
          universe_collection_pic: universeCollectionPic,
          user_id: userId,
          description: description,
          source_universe: collectionUniverseId,
          is_published: false
        })
        .returning({ newUniverseId: collectionUniverses.collection_universe_id});
  
      console.log("Finished Creating collectionUniverse");
  
      let newUniverseId;
      try {
        newUniverseId = newUniverseQuery[0].newUniverseId;
      } catch (error) {
        console.log("Error Creating new collectioUniverse");
        console.log(error);
      }
      console.log("newUniverseId: ", newUniverseId);

      const customAttributes = []
      const newCollection = await trx.insert(collections).values({
        name: collectionName,
        user_id: userId,
        collection_universe_id: newUniverseId,
        collection_pic: universeCollectionPic,
        custom_attributes: customAttributes,
        favorite_attributes: defaultAttributes.slice(0,4),
    }).returning({ collection_id: collections.collection_id});
  
      console.log("finding creatorUniverseCollectables");
      // select creator universe collectables
      const creatorUniverseCollectables = await trx
        .select({ creatorUniverseCollectables: universeCollectables.universe_collectable_id })
        .from(universeCollectables)
        .where(
          and(
            eq(universeCollectables.collection_universe_id, collectionUniverseId),
            eq(true, universeCollectables.is_published)
          )
        )
        .execute();
        
      let creatorCollectableIds;
      let numCollectables;
      try {
        numCollectables = creatorUniverseCollectables.length;
        creatorCollectableIds = creatorUniverseCollectables.map(item => item.creatorUniverseCollectables);
        console.log("creatorCollectableIds: ", creatorCollectableIds);
      } catch (error) {
        console.log("Error grabbing creatorUniverseCollectables");
        return res.status(400).send("Error grabbing creatorUniverseCollectables");
      }
      console.log("Found creatorUniverseCollectables");
      console.log("numCollectables: ", numCollectables); // if 3 published collectables, then prints 3
      
      // Pack new universe collectables for insert
      const newUniverseCollectables = Array.from({ length: numCollectables }, () => ({
        collection_universe_id: newUniverseId,
        is_published: false
      }));
      console.log("newUniverseCollectables.length: ", newUniverseCollectables.length);


      console.log("Creating new universe collectables");
      // insert packed universe collectables
      const newUniverseCollectablesQuery = await trx
        .insert(universeCollectables)
        .values(newUniverseCollectables)
        .returning({ newCollectable: universeCollectables.universe_collectable_id });
  
      
      let newUniverseCollectableIds;
      try {
        newUniverseCollectableIds = newUniverseCollectablesQuery.map(item => item.newCollectable); 
        console.log("newUniverseCollectablesIds: ", newUniverseCollectableIds);
      } catch (error) {
        console.log("Failed to create new universe collectables");
        console.log(error);
      }
      console.log("Finished Creating new universe collectables\n");
      
      // last step is to grab non_custom attributes and then copy them
      // let creatorCollectableIds;
      // let numCollectables;
      // attributesLength

      // select creator attributes
      console.log("Fetching creator attributes");
      const creatorAttributes = await trx
        .select({
          attributeName: collectableAttributes.name,
          slug: collectableAttributes.slug,
          value: collectableAttributes.value
        })
        .from(collectableAttributes)
        .where(
          and(
            inArray(collectableAttributes.universe_collectable_id, creatorCollectableIds)),
            eq(collectableAttributes.is_custom, false)
        )
        .execute();
      console.log("finished fetching creator attributes\n");

      console.log("Num of attributes collectableAttributes rows to copy: ", creatorAttributes.length);
      const newCollectableAttributes = [];
      for (let i = 0; i < creatorAttributes.length; i++) {
        const newCollectableId = newUniverseCollectableIds[Math.floor(i / (1+attributesLength))];
        newCollectableAttributes.push({
          collection_universe_id: newUniverseId,
          universe_collectable_id: newCollectableId,
          name: creatorAttributes[i].attributeName,
          slug: creatorAttributes[i].slug,
          value: creatorAttributes[i].value,
          is_custom: false
        });
      }

      console.log("Inserting: ", newCollectableAttributes);
      await trx
        .insert(collectableAttributes)
        .values(newCollectableAttributes)
        .execute();

      console.log("Successfully copied collectable attributes");
      res.status(200).send("Successfully copied unviverse");
    });
  } catch (error) {
    console.log("FAILED to copy universe");
    console.log(error)
    res.status(400).send("Failed to copy universe");
  }

});


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
router.delete('/delete-universe/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await db.delete(collectionUniverses)
      .where(eq(id, collectionUniverses.collection_universe_id))
      .execute();
      
    res.status(204).send("Successfully deleted Universe"); // No content on successful delete
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error deleting item' });
  }
});

module.exports = router;
