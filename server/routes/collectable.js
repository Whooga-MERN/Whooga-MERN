require("dotenv").config({ path: __dirname + "/.env" });
//const trx = require('../config/trx');
const {collectables, collectionUniverses, universeCollectables, collectableAttributes, collections} = require('../config/schema');
const express = require('express');
const {eq, and, or, inArray, isNull, ilike} = require('drizzle-orm');
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
        console.log(file);
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const s3Client = new S3Client({ region: process.env.AWS_REGION });


// Collectable CRUD APIs

function makeSlug(text) {
  if (!text)
    return null;

  // Convert to lowercase
  text = text.toLowerCase();
  
  // Remove special characters (except underscores)
  text = text.replace(/[^a-z0-9\s_]/g, '');
  
  // Replace spaces with underscores
  text = text.replace(/\s+/g, '_');
  
  // Remove any leading or trailing underscores
  text = text.replace(/^_+|_+$/g, '');

  return text;
}


router.post('/newCollectable', upload.single('collectableImage'), async(req, res) => {
  const {collection_id, attributes_values_json, isPublished} = req.body;
  
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

  if(!isPublished) {
    console.log("Missing isPublished");
    return res.status(404).send({ error: "Missing isPublished"});
  }
  const isPublishedBool = isPublished === 'true';

  console.log("isPublished: ", isPublished);
  console.log("attribute_values_json\n", attributes_values_json);
  const parsedAttributeValues = JSON.parse(attributes_values_json);
  console.log("parsedAttributeValue\n", parsedAttributeValues);

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

    console.log("imageUrl: ", imageUrl);

    await db.transaction(async (trx) => {
      console.log("Fetching Universe Collection Id\n");
      const fetchUniverseCollectionId = await trx
      .select({collection_universe_id: collections.collection_universe_id})
      .from(collections)
      .where(eq(collections.collection_id, collection_id))
      .execute();

  
      if(!fetchUniverseCollectionId) {
        console.log("Could not find Universe Collection associated with collection");
        return res.status(404).send({ error: "Could not find Universe Collection associated with collection"});
      }

      const collection_universe_id = fetchUniverseCollectionId[0].collection_universe_id;
      console.log("collection universe id: \n", collection_universe_id);

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

      console.log("Finished fetching custom attributes and default attributes\n");
      let customAttributes = []; // currently not used
      let defaultAttributes = [];
      if(attributesQuery.length > 0) {
        customAttributes = attributesQuery[0].custom_attributes;
        defaultAttributes = attributesQuery[0].default_attributes;
        console.log("customAttributes: ", customAttributes);
        console.log("defaultAttributes: ", defaultAttributes);
      }
      else {
        return res.status(404).send("Did not find custom and default attributes");
      }

      // Create Universe Collectable
      console.log("Creating universe Collectable\n");
      const newUniverseCollectable = await trx
      .insert(universeCollectables)
      .values({
        collection_universe_id: collection_universe_id,
        is_published: isPublishedBool
      })
      .returning({
        universe_collectable_id: universeCollectables.universe_collectable_id
      })
      .execute();

      const universe_collectable_id = newUniverseCollectable[0].universe_collectable_id;
      const row = parsedAttributeValues;
      console.log("Universe Collectable id:\n ", universe_collectable_id);
      console.log("row\n", row);

      let customAttributeInsert = [];
      let defaultAttributeInsert = [];
      let insertValue = null;

      console.log("Creating attributes\n");
      if (row.owned === 'T') {
        console.log("user owns collectable... First creating collectable");
        const newCollectable = await trx
        .insert(collectables)
        .values({
          collection_id: collection_id,
          universe_collectable_id: universe_collectable_id,
        })
        .returning({ collectable_id: collectables.collectable_id });
        
        for (const[key, value] of Object.entries(row)) {

          if(!value)
            insertValue = "empty";
          else
            insertValue = value;

          if(key != "owned") {
            if(defaultAttributes.includes(key)) {
              defaultAttributeInsert.push({
                collection_universe_id: collection_universe_id,
                collection_id: null,
                universe_collectable_id: universe_collectable_id,
                name: key,
                slug: key.toLowerCase().replace(/\s+/g, '_'),
                value: insertValue,
                is_custom: false
              });
            }
            else {
              customAttributeInsert.push({
                collection_universe_id: collection_universe_id,
                collection_id: collection_id,
                universe_collectable_id: universe_collectable_id,
                name: key,
                slug: key.toLowerCase().replace(/\s+/g, '_'),
                value: insertValue,
                is_custom: true
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
            if(defaultAttributes.includes(key)) {
              defaultAttributeInsert.push({
                collection_universe_id: collection_universe_id,
                collection_id: collection_id,
                universe_collectable_id: universe_collectable_id,
                name: key,
                slug: key.toLowerCase().replace(/\s+/g, '_'),
                value: insertValue,
                is_custom: false
              });
            }
            else {
              customAttributeInsert.push({
                collection_universe_id: collection_universe_id,
                collection_id: collection_id,
                universe_collectable_id: universe_collectable_id,
                name: key,
                slug: key.toLowerCase().replace(/\s+/g, '_'),
                value: insertValue,
                is_custom: true
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
          collection_universe_id: collection_universe_id,
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
          collection_universe_id: collection_universe_id,
          collection_id: null,
          collectable_id: null,
          universe_collectable_id: universe_collectable_id,
          name: "image",
          slug: "image",
          value: "",
          is_custom: false
        })
        .execute();
      }

      return res.status(200).send({ message: 'Collectable created successfully' });
  }) } catch (error) {
    console.log(error);
    
    try {
      if(imageUrl) {
        const filename = imageUrl.split('/').pop();
        console.log(filename);
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filename
        };
        return s3Client.send(new DeleteObjectCommand(params));
      }
    } catch (error) {
      return res.status(500).send({ error: 'Failed to create new collectable... Failed to delete new S3 Image'});
    }

    return res.status(500).send({ error: 'Failed to create new collectable'});
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
router.get('/single-collectable/:id', async (req, res) => {
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

router.get('/collection/:collection_id', async (req, res) => {
  const { collection_id } = req.params;

  try {
    // Fetch collectables based on the given collection_id
    const collectedItems = await db
      .select()
      .from(collectables) // Ensure this matches your pgTable definition
      .where(eq(collectables.collection_id, collection_id));

    // Check if any collectables were found
    if (collectedItems.length === 0) {
      return res.status(404).send({ error: 'No collectables found in this collection' });
    }

    // Extract universe_collectable_ids from the found collectables
    const collectableIds = collectedItems.map(c => c.universe_collectable_id);

    // Fetch attributes for the collectables using their universe_collectable_ids
    const attributes = await db
      .select()
      .from(collectableAttributes)
      .where(inArray(collectableAttributes.universe_collectable_id, collectableIds));

    // Combine collectables with their corresponding attributes
    const collectablesWithAttributes = collectedItems.map(collectable => {
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

router.get('/collection-paginated/:collection_id', async (req, res) => {
  const { collection_id } = req.params;
  const { page = 1, itemsPerPage = 8, sortBy, order = 'asc' } = req.query;

  const sortBySlug = makeSlug(sortBy);

  try {
    // Retrieve the favorite attributes for the collection
    const collectionResult = await db
      .select({ favorite_attributes: collections.favorite_attributes })
      .from(collections)
      .where(eq(collections.collection_id, collection_id));

    if (collectionResult.length === 0) {
      return res.status(404).send({ error: 'Collection not found' });
    }

    const favoriteAttributes = collectionResult[0].favorite_attributes || [];

    // Fetch all collectables for the specified collection (we'll sort before paginating)
    const collectedItems = await db
      .select()
      .from(collectables)
      .where(eq(collectables.collection_id, collection_id));

    if (collectedItems.length === 0) {
      return res.status(404).send({ error: 'No collectables found in this collection' });
    }

    const collectableIds = collectedItems.map(c => c.universe_collectable_id);

    // Fetch attributes for the collectables
    const attributes = await db
      .select()
      .from(collectableAttributes)
      .where(inArray(collectableAttributes.universe_collectable_id, collectableIds));

    let collectablesWithAttributes = collectedItems.map(collectable => {
      const relatedAttributes = attributes.filter(
        attribute => 
          attribute.universe_collectable_id === collectable.universe_collectable_id &&
          (favoriteAttributes.includes(attribute.name) || attribute.name === "image")
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

    // Apply sorting if sortBy parameter is provided
    if (sortBySlug) {
      collectablesWithAttributes.sort((a, b) => {
        const attrA = a.attributes.find(attr => attr.slug === sortBySlug);
        const attrB = b.attributes.find(attr => attr.slug === sortBySlug);

        if (!attrA || !attrB) return 0;

        const valueA = attrA.value;
        const valueB = attrB.value;

        const isNumericA = !isNaN(valueA);
        const isNumericB = !isNaN(valueB);

        if (isNumericA && isNumericB) {
          return order === 'desc' 
            ? parseFloat(valueB) - parseFloat(valueA) 
            : parseFloat(valueA) - parseFloat(valueB);
        } else {
          return order === 'desc' 
            ? valueB.localeCompare(valueA) 
            : valueA.localeCompare(valueB);
        }
      });
    }

    // Calculate total collectables matching the criteria before pagination
    const totalMatchingCollectables = collectablesWithAttributes.length;

    // Apply pagination
    const offset = (page - 1) * itemsPerPage;
    const paginatedCollectables = collectablesWithAttributes.slice(offset, offset + parseInt(itemsPerPage));

    res.json({
      totalMatchingCollectables,
      collectables: paginatedCollectables
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching collectables and attributes' });
  }
});

router.put('/edit-collectable', upload.single('collectableImage'), async (req, res) => {
  const { collectionId, universeCollectableId, attributeValuesJson, owned, isPublished} = req.body;
  let image = null;
  if(req.file)
    image = req.file;
  else
    console.log("No Image Provided");

  if(!universeCollectableId || isNaN(universeCollectableId))
    return res.status(500).json({ message: "Invalid input for universeCollectableId" });
  if(!collectionId || isNaN(collectionId))
    return res.status(500).json({ message: "Invalid input for collectionId" });
  if(!attributeValuesJson)
    return res.status(500).json({ message: "Invalid input for parsedAttributeValuesJson" });
  if(!owned)
    return res.status(500).json({ message: "owned parameter not given"});
  if(!isPublished)
    return res.status(500).json({ message: "isPublished parameter not given"});

  const isPublishedBool = isPublished === "T";

  const parsedAttributeValuesJson = JSON.parse(attributeValuesJson);
  console.log(parsedAttributeValuesJson);
  await db.transaction(async (trx) => {
    try {
      console.log("Querying for collectableId");
      const collectableIdQuery = await trx
        .select({ collectable_id: collectables.collectable_id })
        .from(collectables)
        .where(eq(universeCollectableId, collectables.universe_collectable_id))
        .execute();
      console.log("Finished querying for collectableId");
      
      console.log("collectableIdQuery.length: ", collectableIdQuery.length);
      if(collectableIdQuery.length < 1) {
        console.log("Before update, not owned");
        if(owned === 'T') { 
          console.log("Changing to owned");
          const newCollectableQuery = trx
          .insert(collectables)
          .values({
            collection_id: collectionId,
            universe_collectable_id: universeCollectableId
          })
          .execute();
          console.log("finished changing to owned");
        }

        console.log("Updating Attributes");
        const updateAttributes = Object.entries(parsedAttributeValuesJson).map(async ([key, value]) => {
          console.log("key: ", key.toLowerCase().replace(/\s+/g, '_'), " value: ", value);
          const query = await trx
            .update(collectableAttributes)
            .set({ value: value })
            .where(
              and(
                eq(collectableAttributes.slug, key.toLowerCase().replace(/\s+/g, '_')),
                eq(collectableAttributes.universe_collectable_id, universeCollectableId),
                or(eq(collectableAttributes.collection_id, collectionId), isNull(collectableAttributes.collection_id))
              )
            )
            .execute();
        });
        console.log("Finished Updating Attributes");

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

          console.log("Updating Image");
          await trx
            .update(collectableAttributes)
            .set({ value: imageUrl })
            .where(
              and(
                eq(collectableAttributes.slug, 'image'),
                eq(collectableAttributes.universe_collectable_id, universeCollectableId),
                or(eq(collectableAttributes.collection_id, collectionId), isNull(collectableAttributes.collection_id))
              )
            )
            .execute();
          console.log("Finished Updating Image");
        }
      }
      else {
        console.log("Before update, is owned");
        const collectableId = collectableIdQuery[0].collectable_id;
        if(owned === 'F')
        {
          console.log("Marking Collectable as unowned");
          const deleteCollectableQuery = await trx
            .delete(collectables)
            .where(eq(collectableId, collectables.collectable_id))
            .returning();
            console.log("Finished Marking Collectable as unowned");
        }

        console.log("Updating Attributes");
        const updateAttributes = Object.entries(parsedAttributeValuesJson).map(async ([key, value]) => {
          console.log("key: ", key, " value: ", value);
          const query = await trx
            .update(collectableAttributes)
            .set({ value: value })
            .where(
              and(
                eq(collectableAttributes.slug, key.toLowerCase().replace(/\s+/g, '_')),
                eq(collectableAttributes.universe_collectable_id, universeCollectableId),
                or(eq(collectableAttributes.collection_id, collectionId), isNull(collectableAttributes.collection_id))
              )
            )
            .execute();
        });

        await Promise.all(updateAttributes);
        console.log("Finished Updating Attributes");
        
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

          console.log("Updating Image");
          await trx
            .update(collectableAttributes)
            .set({ value: imageUrl })
            .where(
              and(
                eq(collectableAttributes.slug, 'image'),
                eq(collectableAttributes.universe_collectable_id, universeCollectableId),
                or(eq(collectableAttributes.collection_id, collectionId), isNull(collectableAttributes.collection_id))
              )
            )
            .execute();
          console.log("Finished Updating Image");
        }
      }

      await trx
        .update(universeCollectables)
        .set({is_published: isPublishedBool})
        .where(eq(universeCollectables.universe_collectable_id, universeCollectableId))
        .execute();

      console.log("Succesfully updated attributes");
      res.status(200).send("Succesfully updated attributes");
    } catch (error) {
      console.log(error);
      try {
        if(imageUrl)
          await deleteS3File(imageUrl); // for some reason always fails
      } catch (error) {
        return res.status(500).send({ error: 'Failed to update collectable... Failed to delete new S3 Image'});
      }

      res.status(500).send("ERROR failed to update attributes of collectable");
    }
  });
});

// UPDATE
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { collectablePic } = req.body;
  try {
    const result = await db
      .update(collectables)
      .set({collectable_pic: collectablePic})
      .where(eq(collectables.collectable_id, id))
      .execute();
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
router.delete('/mark-unowned/:id', async (req, res) => {
  const { id } = req.params;

  await db.transaction(async (trx) => {
    try {

      const deletedItem = await trx.delete(collectables)
        .where(eq(id, collectables.collectable_id))
        .returning(); // Fetch the deleted item
  
      if (deletedItem.length === 0) {
        return res.status(404).send({ error: 'Item not found' });
      }
      
      const updatedItemAttributes = await trx
      .update(collectableAttributes)
      .set({collectable_id: null})
      .where(eq(collectableAttributes.collectable_id, id))
      .execute();
  
      if(updatedItemAttributes === 0) {
        return res.status(404).send({ error: 'Item Attributes not found for deletion' });
      }
  
      res.status(200).send("Collectable Deleted"); // No content on successful delete
    } catch (error) {
      
      console.error(error);
      res.status(500).send({ error: 'Error deleting item' });
    }
  });
});

router.get('/jump', async (req, res) => {
  const { collectionId, attributeToSearch, searchTerm, itemsPerPage = 8, sortBy, order = 'asc' } = req.query;

  if (!collectionId || !attributeToSearch || !searchTerm) {
    return res.status(400).send({ error: 'Missing a request parameter' });
  }

  const sortBySlug = makeSlug(sortBy);

  try {
    const attributesToSearch = Array.isArray(attributeToSearch) ? attributeToSearch : [attributeToSearch];
    const searchTerms = Array.isArray(searchTerm) ? searchTerm : [searchTerm];

    // Call makeSlug for each attribute
    attributesToSearch.forEach((attribute, index, array) => {
      array[index] = makeSlug(attribute); // Update each attribute in the array with its slugified version
  });

    if (attributesToSearch.length !== searchTerms.length) {
      return res.status(400).send({ error: 'Attributes and search terms must be paired.' });
    }

    //Retrieve collection's favorite attributes
    const collectionResult = await db
      .select({ favorite_attributes: collections.favorite_attributes })
      .from(collections)
      .where(eq(collections.collection_id, collectionId));

    if (collectionResult.length === 0) {
      return res.status(404).send({ error: 'Collection not found' });
    }

    const favoriteAttributes = collectionResult[0].favorite_attributes || [];

    //Fetch collectables and attributes for the specified collection
    const collectedItems = await db
      .select()
      .from(collectables)
      .where(eq(collectables.collection_id, collectionId));

    const collectableIds = collectedItems.map(c => c.universe_collectable_id);

    const attributes = await db
      .select()
      .from(collectableAttributes)
      .where(inArray(collectableAttributes.universe_collectable_id, collectableIds));

    let collectablesWithAttributes = collectedItems.map(collectable => {
      const relatedAttributes = attributes.filter(
        attribute =>
          attribute.universe_collectable_id === collectable.universe_collectable_id &&
          favoriteAttributes.includes(attribute.name)
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

    //Apply sorting
    if (sortBySlug) {
      collectablesWithAttributes.sort((a, b) => {
        const attrA = a.attributes.find(attr => attr.slug === sortBySlug);
        const attrB = b.attributes.find(attr => attr.slug === sortBySlug);

        if (!attrA || !attrB) return 0;

        const valueA = attrA.value;
        const valueB = attrB.value;

        const isNumericA = !isNaN(valueA);
        const isNumericB = !isNaN(valueB);

        if (isNumericA && isNumericB) {
          return order === 'desc' 
            ? parseFloat(valueB) - parseFloat(valueA) 
            : parseFloat(valueA) - parseFloat(valueB);
        } else {
          return order === 'desc' 
            ? valueB.localeCompare(valueA) 
            : valueA.localeCompare(valueB);
        }
      });
    }

    // Find the first matching collectable by search term
    const matchingCollectable = collectablesWithAttributes.find(c =>
      attributesToSearch.every((attribute, index) => {
        const attr = c.attributes.find(a => a.slug === attribute);
        return attr && attr.value.toLowerCase().includes(searchTerms[index].toLowerCase());
      })
    );

    if (!matchingCollectable) {
      return res.status(404).send({ error: 'No matching collectables found' });
    }

    const firstMatchId = matchingCollectable.collectable_id;
    const firstMatchUniverseId = matchingCollectable.universe_collectable_id;
    const firstMatchIndex = collectablesWithAttributes.findIndex(
      c => c.collectable_id === firstMatchId
    );

    // Calculate the page number where the first matching collectable is located
    const pageNumber = Math.floor(firstMatchIndex / itemsPerPage) + 1;

    res.json({
      pageNumber: pageNumber,
      collectable_id: firstMatchId,
      universe_collectable_id: firstMatchUniverseId
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching collectables and attributes' });
  }
});









module.exports = router;