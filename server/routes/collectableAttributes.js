require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {collections, collectionUniverses, collectableAttributes, universeCollectables} = require('../config/schema');
const express = require('express');
const {eq, count, inArray, and} = require('drizzle-orm');
//const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
//router.use(authenticateJWTToken);

router.get('/all-attributes/:collectionId', async (req, res) => {
    const { collectionId } = req.params;
    try {

      if(!collectionId || isNaN(collectionId)) {
        return res.status(400).json({ message: 'Invalid input for collectionId'} );
      }

      const attributesQuery = await db
        .select({          
          custom_attributes: collections.custom_attributes,
          default_attributes: collectionUniverses.default_attributes
        })
        .from(collections)
        .innerJoin
        (collectionUniverses, eq(collections.collection_universe_id, collectionUniverses.collection_universe_id))
        .where
        (eq(collections.collection_id, collectionId));
      
        let customAttributes = [];
        let defaultAttributes = [];
        if(attributesQuery.length > 0) {
          customAttributes = attributesQuery[0].custom_attributes;
          defaultAttributes = attributesQuery[0].default_attributes;
          console.log("customAttributes: ", customAttributes);
          console.log("defaultAttributes: ", defaultAttributes);
        }
        else {
          res.status(404).send("Did not find custom and default attributes");
        }

        if(customAttributes)
        {
          const combinedAttributes = [...defaultAttributes, ...customAttributes];

          console.log("combinedAttributes ", combinedAttributes);
          return res.status(200).json(combinedAttributes);
        }

        console.log("combinedAttributes ", defaultAttributes);
        return res.status(200).json(defaultAttributes);

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/default-attributes/:collectionId', async (req, res) => {
  const { collectionId } = req.params;

  if(!collectionId || isNaN(collectionId)) {
    return res.status(400).json({ message: 'Invalid input for collectionId'} );
  }

  console.log("Searching for default attributes\n");
  const defaultAttributesQuery = await db
    .select({ default_attributes: collectionUniverses.default_attributes})
    .from(collections)
    .innerJoin(collectionUniverses, eq(collections.collection_universe_id, collectionUniverses.collection_universe_id))
    .where(eq(collectionId, collections.collection_id))
    .execute();

  let defaultAttributes = [];
  if(defaultAttributesQuery.length > 0) {
    defaultAttributes = defaultAttributesQuery[0].default_attributes;
  } 
  else {
    return res.status(404).json({ error: "Did not find default attributes" });
  }

  console.log("default attributes: ", defaultAttributes);
  return res.status(200).json(defaultAttributes);
});

router.get('/custom-attributes/:collectionId', async (req, res) => {
  const { collectionId } = req.params;

  if(!collectionId || isNaN(collectionId))
    return res.status(400).json( { message: 'Invalid input for collectionId'} );

  console.log("Searching for Custom Attributes");
  const customAttributesQuery = await db
    .select({custom_attributes: collections.custom_attributes})
    .from(collections)
    .where(eq(collectionId, collections.collection_id))
    .execute();

  let custom_attributes = [];
  if(customAttributesQuery.length > 0)
  {
    console.log("found custom attributes");
    custom_attributes = customAttributesQuery[0].custom_attributes;
  }
  else
    return res.status(404).json({ error: "Did not find custom attributes"});
  
  console.log("custom attributes: ", custom_attributes);
  return res.status(200).json(custom_attributes);
});

router.get('/masked-attributes/:collectionId', async (req, res) => {
  const { collectionId } = req.params;

  if(!collectionId || isNaN(collectionId))
    return res.status(400).json({ message: "Invalid input for collectionId"});

  try {
    console.log("collectionId: ", collectionId);
    console.log("Searching for, custom, hidden and default attributes...");
    const attributesQuery = await db
    .select({
      custom_attributes: collections.custom_attributes,
      hidden_attributes: collections.hidden_attributes,
      default_attributes: collectionUniverses.default_attributes
    })
    .from(collections)
    .innerJoin(collectionUniverses, eq(collections.collection_universe_id, collectionUniverses.collection_universe_id))
    .where(eq(collectionId, collections.collection_id))
    .execute();
  
    console.log("Finished searching for all attribute types");  
    let customAttributes = [];
    let hiddenAttributes = [];
    let defaultAttributes = [];
    let combinedAttributes = [];
    if(attributesQuery.length > 0) {
      customAttributes = attributesQuery[0].custom_attributes;
      hiddenAttributes = attributesQuery[0].hidden_attributes;
      defaultAttributes = attributesQuery[0].default_attributes;
    }
    console.log(customAttributes);
    console.log(hiddenAttributes);
    console.log(defaultAttributes);
  
    if(!customAttributes && !hiddenAttributes) {
      console.log("CustomAttributes and Hidden attributes are null\n");
      console.log("Combined Attributes: ", defaultAttributes);
      return res.status(200).json(defaultAttributes);
    }
  
    if(!hiddenAttributes) {
      console.log("Hidden attributes are null\n");
      combinedAttributes = [...defaultAttributes, ...customAttributes];
      console.log("Combined Atributes: ", combinedAttributes);
      return res.status(200).json(combinedAttributes);
    }
  
    if(!customAttributes) {
      combinedAttributes = defaultAttributes.filter(attr => !hiddenAttributes.includes(attr));
      console.log("Combined Attributes: ", combinedAttributes);
      return res.status(200).json(combinedAttributes);
    }

    if(customAttributes.length > 0 && hiddenAttributes.length > 0) {
      combinedAttributes = [...defaultAttributes, ...customAttributes];
      maskedAttributes = combinedAttributes.filter(attr => !hiddenAttributes.includes(attr));
      console.log("Combined Attributes: ", maskedAttributes);
      return res.status(200).json(maskedAttributes);
    }
  
    return res.status(500).send("FAILED: NO IF STATEMENT WAS TRIGGERED");
  } catch (error) {
    console.log(error);
    return res.status(500).send("ERROR FAILED");
  }
});

router.get('/get-favorite-attributes', async (req, res) => {
  const { collectionId } = req.query;
  console.log(collectionId);
  if(!collectionId)
  {
    console.log("Invalid or no input for collectionId");
    return res.status(400).json({ message: "Invalid or no input for collectionId"});
  }

  try {
    console.log("Fetching Favorite Attributes");
    const favoriteAttributesQuery = await db
    .select({ favoriteAttributes: collections.favorite_attributes})
    .from(collections)
    .where(eq(collectionId,collections.collection_id));
    console.log("Finished Fetching Favorite Attributes");

    res.status(200).json(favoriteAttributesQuery);
  } catch (error) {
    console.log("Failed to fetch favorite attributes");
    console.log(error);
    res.status(400).send("Failed to fetch favorite attributes");
  }
});


router.put('/update-favorite-attributes', async (req, res) => {
  const { collectionId, favoriteAttributes } = req.body;
 
  if(!favoriteAttributes && favoriteAttributes.length < 1)
    return res.status(404).send("No favoriteAttributes given");
  if(!collectionId || isNaN(collectionId))
    return res.status(400).json({ message: "Invalid input for collectionId"});

  try {
    console.log("Updating attributes\n");
    const updatedAttributes = await db
    .update(collections)
    .set({
      favorite_attributes: favoriteAttributes
    })
    .where(eq(collections.collection_id, collectionId))
    .execute();

    console.log("Attributes updated\n");

    res.status(400).send("Favorite Attributes Succesfully updated");
  } catch (error) {
    res.status(500).send("FAILED to update favorite attributes");
  }
}); 

router.put('/add-custom-attributes', async (req, res) => {
  const { customAttributes, collectionUniverseId } = req.body;
    //so this is array of new attributes
  if(!customAttributes || customAttributes.length < 1) {
    console.log("customAttributes not given or given improperly");
    res.status(404).send("customAttributes not given or given improperly");
  }
  if(!collectionUniverseId || isNaN(collectionUniverseId)) {
    console.log("colletionUniverseId not given or given improperly")
    res.status(404).send("colletionUniverseId not given or given improperly");
  }

  // Finding original custom attributes
  try {
    console.log("Fetching originalCustomAttributes");
    const customAttributesQuery = await db
      .select({ originalCustomAttributes: collections.custom_attributes })
      .from(collections)
      .where(eq(collectionUniverseId, collections.collection_universe_id))
      .execute();
  
    let combinedAttributes;
    try {
      combinedAttributes = [...customAttributesQuery[0].originalCustomAttributes, ...customAttributes];
    } catch (error) {
      console.log("Failed to fetch customAttributes");
      console.log(error);
      return res.status(404).send("Failed to fetch customAttributes");
    }
    console.log("Finished Fetching originalCustomAttributes");
  
    await db.transaction(async (trx) => {
      // Updates custom_attributes in collections
      console.log("Updating custom_attributes in collections");
      await trx
        .update(collections)
        .set({ custom_attributes: combinedAttributes })
        .where(eq(collectionUniverseId, collections.collection_universe_id))
        .execute();
      console.log("Finished Updating custom_attributes in collections\n");
  
      // Find the number of collectables
      console.log("Finding universeCollectables for universeCollection");
      const universeCollectablesQuery = await trx
      .select(
        {
          universeCollectable: universeCollectables.universe_collectable_id
        }
      )
      .from(universeCollectables)
      .where(eq(collectionUniverseId, universeCollectables.collection_universe_id))
      .execute();
  
      let numCollectables = 0;
      try {
        numCollectables = universeCollectablesQuery.length;
        console.log("numCollectables: ", numCollectables);
      } catch (error) {
        return res.status(404).send("Failed to find universeCollectables count");
      }
      console.log("Finished Finding count() of universeCollectables for universeCollection\n");
  
      let collectableAttributesInsert = []
  
      for(let i = 0; i < customAttributes.length; i++)
      {
        universeCollectablesQuery.map(collectable => {
          collectableAttributesInsert.push({
            collection_universe_id: collectionUniverseId,
            universe_collectable_id: collectable.universeCollectable,
            name: customAttributes[i],
            slug: customAttributes[i].toLowerCase().replace(/\s+/g, '_'),
            value: '',
            is_custom: true,
          })
        })
      }

      await trx
        .insert(collectableAttributes)
        .values(collectableAttributesInsert)
        .execute();

      console.log("Succesfully added custom attribute");
      res.status(200).send("Succesfully added custom attribute");
    });
  } catch (error) {
    console.log("Failed to add custom attribute");
    console.log(error);
    res.status(400).send("Failed to add custom attribute");
  }
});

router.put('/add-hidden-attribute', async (req, res) => {
  const { attributes, collectionUniverseId } = req.body;
  if(!attributes) {
    console.log("Invalid attributes given: ", attributes);
    return res.status(404).send("Invalid attributes given");
  }

  try {
    await db.transaction(async (trx) => {
      
      console.log("Fetching favorite attributes");
      const favoriteAttributesQuery = await trx
        .select({
          favoriteAttributes: collections.favorite_attributes,
          hiddenAttributes: collections.hidden_attributes
        })
        .from(collections)
        .where(eq(collections.collection_universe_id, collectionUniverseId))
        .execute();

      let combinedAttributes;
      const hiddenAttributes = [...attributes, ...favoriteAttributesQuery[0].hiddenAttributes];
      try {
        console.log("favoriteAttributes: ", favoriteAttributesQuery[0].favoriteAttributes);
        combinedAttributes = favoriteAttributesQuery[0].favoriteAttributes.filter(attr => !hiddenAttributes.includes(attr));
        console.log("combinedAttributes: ", combinedAttributes);
      } catch (error) {
        console.log("Failed to fetch customAttributes");
        console.log(error);
        return res.status(404).send("Failed to fetch customAttributes");
      }
      console.log("finisehd fetchinf favorite attributes");
      
      console.log("updating favorite and hidden attributes")
      await trx
        .update(collections)
        .set(
          {
            favorite_attributes: combinedAttributes,
            hidden_attributes: hiddenAttributes
          }
        )
        .where(eq(collections.collection_universe_id, collectionUniverseId))
        .execute();

      console.log("Finished updating favorite and hidden attributes");

      res.status(200).send("Succesfully updated hidden attributes");
    });
  } catch (error) {
    console.log("failed to hide attribute");
    console.log(error);
    res.status(400).send("failed to hide attribute");
  }

});

router.delete('/remove-custom-attribute', async (req, res) => {
  const { customAttributes, collectionUniverseId } = req.body;

  if(!customAttributes || customAttributes.length < 1) {
    console.log("customAttributes not given or given improperly");
    res.status(404).send("customAttributes not given or given improperly");
  }
  if(!collectionUniverseId || isNaN(collectionUniverseId)) {
    console.log("colletionUniverseId not given or given improperly")
    res.status(404).send("colletionUniverseId not given or given improperly");
  }

  try {
    console.log("Fetching original custom attributes");
    const customAttributesQuery = await db
      .select({ originalCustomAttributes: collections.custom_attributes })
      .from(collections)
      .where(eq(collections.collection_universe_id, collectionUniverseId))
      .execute();
  
    let originalCustomAttributes;
    try {
      originalCustomAttributes = customAttributesQuery[0].originalCustomAttributes;
      console.log("originalCustomAttributes: ", originalCustomAttributes);
    } catch (error) {
      console.log("Error fetching original custom attributes");
      console.log(error);
    }
    console.log("Finished fetching original custom attributes\n");
  
    const combinedAttributes = originalCustomAttributes.filter(attr => !customAttributes.includes(attr));
  
    await db.transaction(async (trx) => {
  
      console.log("Updating custom_attributes from collections");
      await trx
        .update(collections)
        .set({ custom_attributes: combinedAttributes })
        .where()
        .execute();
        console.log("Finished Updating custom_attributes from collections\n");
  
      console.log("Deleting custom attributes from collectableAttributes");
      await trx
        .delete(collectableAttributes)
        .where(
          and(
            inArray(collectableAttributes.name, customAttributes),
            eq(collectionUniverseId, collectableAttributes.collection_universe_id)
          )
        ) 
        .execute();
      console.log("Finished Deleting custom attributes from collectableAttributes");

    });
  
    res.status(200).send("Successfully deleted custom attributes");
  } catch (error) {
    console.log("Failed to delete custom attribute");
    console.log(error);
    res.status(400).send("Failed to delete custom attributes");
  }
});

module.exports = router;