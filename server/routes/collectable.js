require("dotenv").config({ path: __dirname + "/.env" });
//const trx = require('../config/trx');
const {collectables, collectionUniverses, universeCollectables, collectableAttributes, collections} = require('../config/schema');
const express = require('express');
const {eq} = require('drizzle-orm');
const fs = require('fs');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createS3File, deleteS3File } = require('../utility/s3BucketUtil');
const { db } = require("../config/db");


const router = express.Router();

const uploadsDir = path.join(__dirname, "../temporary_image_storage");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir); 
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const s3Client = new S3Client({ region: process.env.AWS_REGION });


// Collectable CRUD APIs

router.post('/newCollectable', upload.single('collectableImage'), async(req, res) => {
  const {collection_id, attributes_values_json, isWishlist} = req.body;

  let image = null;
  if(req.file)
    image = req.file;
  else
    console.log("No Image Provided");

  if(!collection_id) {
    console.log("Missing collection_id");
    return res.status(404).send({ error: "Missing collection_id"});
  }

  if(!attributes_values_json) {
    console.log("Missing attributes_values_json");
    return res.status(404).send({ error: "Missing attributes_values_json"});
  }

  console.log("attribute_values_json\n", attributes_values_json);
  const parsedAttributeValues = JSON.parse(attributes_values_json);
  console.log("parsedAttributeValue\n", parsedAttributeValues);

  const isWishlistBool = isWishlist === 'true';

  try {

    let imageUrl = null;
    if(image)
    {
      console.log("Creating S3 Image File\n");    
      try {
        imageUrl = await createS3File(image);
      } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error creating image for S3 Bucket'});
      }
    }

    await db.transaction(async (trx) => {
      console.log("Fetching Universe Collection Id\n");
      const fetchUniverseCollectionId = await trx
      .select({universe_collection_id: collectionUniverses.collection_universe_id})
      .from(collectionUniverses)
      .where(collectionUniverses.collection_id, collection_id)
      .execute();

      if(!fetchUniverseCollectionId) {
        console.log("Could not find Universe Collection associated with collection");
        return res.status(404).send({ error: "Could not find Universe Collection associated with collection"});
      }

      const collection_universe_id = fetchUniverseCollectionId[0].universe_collection_id;

      // Fetches both custom and default attributes.
      console.log("collection id: ", collection_id);
      console.log("Fetching custom attributes and default attributes\n");
      const attributesQuery = await trx
        .select({
          custom_attributes: collections.custom_attributes,
          default_attributes: collectionUniverses.default_attributes
        })
        .from(collections)
        .innerJoin(collectionUniverses, eq(collections.collection_universe_id, collectionUniverses.collection_universe_id))
        .where(eq(collections.collection_id, collection_id))
        .execute();


      let customAttributes = [];
      let defaultAttributes = [];
      if(attributesQuery.length > 0) {
        customAttributes = attributesQuery[0].custom_attributes;
        defaultAttributes = attributesQuery[0].default_attributes
        console.log("customAttributes: ", customAttributes);
        console.log("defaultAttributes: ", defaultAttributes);
      }
      else {
        res.status(404).send("Did not find custom and default attributes");
      }

      // Create Universe Collectable
      console.log("Creating universe Collectable\n");
      const newUniverseCollectable = await trx
      .insert(universeCollectables)
      .values({
        collection_universe_id: collection_universe_id,
      })
      .returning({
        universe_collectable_id: universeCollectables.universe_collectable_id
      })
      .execute();

      const universe_collectable_id = newUniverseCollectable[0].universe_collectable_id;
      const row = parsedAttributeValues;
      console.log("row\n", row);

      let customAttributeInsert = [];
      let defaultAttributeInsert = [];
      let insertValue = null;
      // Create Attributes
      console.log("Creating attributes\n");
      if (row.owned === 'T') {

        console.log("user owns collectable... First creating collectable");
        const newCollectable = await trx
        .insert(collectables)
        .values({
          collection_id: collection_id,
          universe_collectable_id: universe_collectable_id,
          isWishlist: isWishlistBool
        })
        .returning({ collectable_id: collectables.collectable_id });
        
        for (const[key, value] of Object.entries(row)) {

          if(!value)
            insertValue = "empty";
          else
            insertValue = value;

          if(key != "owned") {
            if(customAttributes.includes(key)) {
              customAttributeInsert.push({
                collection_id: collection_id,
                collectable_id: newCollectable[0].collectable_id,
                universe_collectable_id: universe_collectable_id,
                name: key,
                slug: key.toLowerCase().replace(/\s+/g, '_'),
                value: insertValue,
                is_custom: true
              });
            }
            else {
              defaultAttributeInsert.push({
                collection_id: null,
                collectable_id: null,
                universe_collectable_id: universe_collectable_id,
                name: key,
                slug: key.toLowerCase().replace(/\s+/g, '_'),
                value: insertValue,
                is_custom: false
              });
            }
          }
        }
      }
      else {
        for (const[key, value] of Object.entries(row)) {
          if(key != "owned") {
            if(!value)
              insertValue = "empty";
            else
              insertValue = value;
            if(customAttributes.includes(key)) {
              customAttributeInsert.push({
                collection_id: collection_id,
                collectable_id: null,
                universe_collectable_id: universe_collectable_id,
                name: key,
                slug: key.toLowerCase().replace(/\s+/g, '_'),
                value: insertValue,
                is_custom: true
              });
            }
            else {
              defaultAttributeInsert.push({
                collection_id: null,
                collectable_id: null,
                universe_collectable_id: universe_collectable_id,
                name: key,
                slug: key.toLowerCase().replace(/\s+/g, '_'),
                value: insertValue,
                is_custom: false
              });
            }
          }
        }
      }

      console.log("customAttributeInsert.length: ", customAttributeInsert.length);
      if(customAttributeInsert.length > 0) {
        await trx.insert(collectableAttributes)
        .values(customAttributeInsert)
        .execute();
      }
      
      console.log("defaultAttributeInsert.length: ", defaultAttributeInsert.length);
      if(defaultAttributeInsert.length > 0) {
        await trx.insert(collectableAttributes)
        .values(defaultAttributeInsert)
        .execute();
      }


      //Insert the image row
      if(imageUrl) {
        await trx
        .insert(collectableAttributes)
        .values({
          collection_id: null,
          collectable_id: null,
          universe_collectable_id: universe_collectable_id,
          name: "image",
          slug: "image",
          value: imageUrl,
          is_custom: false
        })
        .execute();
      }
      else {
        await trx
        .insert(collectableAttributes)
        .values({
          collection_id: null,
          collectable_id: null,
          universe_collectable_id: universe_collectable_id,
          name: "image",
          slug: "image",
          value: "empty",
          is_custom: false
        })
        .execute();
      }

      res.status(200).send({ message: 'Collectable created successfully' });
  }) } catch (error) {
    console.log(error);
    
    try {
      if(imageUrl)
        await deleteS3File(imageUrl);
    } catch (error) {
      res.status(500).send({ error: 'Failed to create new collectable... Failed to delete new S3 Image'});
    }

    res.status(500).send({ error: 'Failed to create new collectable'});
  }

});

// Create
router.post('', async (req, res) => {
    const {collectionId, universeCollectableId, collectablePic} = req.body;

    if (!collectionId || !universeCollectableId) {
        return res.status(400).send({ error: 'Request body is missing a parameter' });
    }

    try {
        const newItem = await trx.insert(collectables).values({
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
    const allItems = await trx.select().from(collectables).execute();
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
    const item = await trx.select()
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
    const allItems = await trx.select()
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
    const allItems = await trx.select()
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
    const result = await trx.update(collectables)
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
    const deletedItem = await trx.delete(collectables)
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