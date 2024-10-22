require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {collections, collectionUniverses, collectableAttributes} = require('../config/schema');
const express = require('express');
const {eq} = require('drizzle-orm');
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

module.exports = router;