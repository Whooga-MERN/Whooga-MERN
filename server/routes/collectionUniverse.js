require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const { collections, collectionUniverses, users, universeCollectables, collectableAttributes, collectables } = require('../config/schema');
const express = require('express');
const { eq, and, inArray } = require('drizzle-orm');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Papa = require("papaparse");
const fs = require('fs');
//const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
//router.use(authenticateJWTToken);

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

const cpUpload = upload.fields([
  { name: 'collectableImages', maxCount: 200_000 }
]);

const bulkUpdateUpload = upload.fields([
  { name: 'collectableImages', maxCount: 4000 }, // Adjust maxCount as needed
  { name: 'originalCSV', maxCount: 1 },
  { name: 'editedCSV', maxCount: 1 }
]);

const parseCSV = (filePath) => {
  const file = fs.readFileSync(filePath, "utf8");
  console.log("file: ", file);
  return Papa.parse(file, { header: true }).data;
};

const diffCSVData = (csvData1, csvData2) => {
  const changes = [];

  // Iterate over each row in csvData1
  csvData1.forEach((row1) => {
    // Find the corresponding row in csvData2 by a unique identifier, like 'id'
    const row2 = csvData2.find((r) => r.id === row1.id); // Adjust if the identifier is different
    if (!row2) {
      console.log("Row id values do not match");
      changes.push({ id: row1.id, change: "Row missing in edited file" });
      return null;
    }

    // Check for differences in each field
    Object.keys(row1).forEach((key) => {
      if (row1[key] !== row2[key]) {
        changes.push({
          id: row1.id,
          field: key,
          oldValue: row1[key],
          newValue: row2[key],
        });
      }
    });
  });

  // // Find rows in csvData2 that are missing from csvData1
  // csvData2.forEach((row2) => {
  //   const row1 = csvData1.find((r) => r.id === row2.id);
  //   if (!row1) {
  //     changes.push({ id: row2.id, change: "Row missing in original file" });
  //   }
  // });

  return changes;
};


router.post('/copy-universe', async (req, res) => {
  const { collectionUniverseId, userEmail } = req.body;

  if (!collectionUniverseId || isNaN(collectionUniverseId)) {
    console.log("None or invalid collectionUniverseId given");
    return res.status(404).send("None or invalid collectionUniverseId given");
  }

  if (!userEmail) {
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
        .returning({ newUniverseId: collectionUniverses.collection_universe_id });

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
        favorite_attributes: defaultAttributes.slice(0, 4),
      }).returning({ collection_id: collections.collection_id });

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
        const newCollectableId = newUniverseCollectableIds[Math.floor(i / (1 + attributesLength))];
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
  const { name, createdBy, defaultAttributes, universeCollectionPic } = req.body;

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
  } catch (error) {
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

router.put('/bulk-update', bulkUpdateUpload, async (req, res) => {
  const { collectionUniverseId } = req.body;

  if (!collectionUniverseId) {
    console.log("collectionUniverseId not given");
    return res.status(404).send("collectionUniverseId not given");
  }

  const urlCollectableImages = [];
  console.log("collectionUniverseId:", collectionUniverseId);

  try {
    const collectableImages = req.files.collectableImages || [];
    const originalCSV = req.files.originalCSV ? req.files.originalCSV[0] : null;
    const editedCSV = req.files.editedCSV ? req.files.editedCSV[0] : null;

    if (collectableImages && collectableImages.length > 0) {
      console.log("uploading images");
      const uploadPromises = collectableImages.map(async file => {
        const fileContent = fs.readFileSync(file.path);
        const uniqueFilename = `${uuidv4()}-${file.originalname}`;
        const params = {
          Bucket: process.env.S3_BUCKET_NAME, // Use the bucket name directly
          Key: uniqueFilename, // Use the unique filename
          Body: fileContent,
          ContentType: file.mimetype
        };
        return s3Client.send(new PutObjectCommand(params)).then(() => {
          // Delete the file from the server after uploading to S3
          const originalName = file.originalname;
          if (fs.existsSync(file.path))
            fs.unlinkSync(file.path);

          const objectUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${uniqueFilename}`;
          urlCollectableImages.push({ url: objectUrl, originalName: originalName });
        }).catch(error => {
          console.error(`Error uploading ${file.filename} to S3:`, error);
          throw new Error(`Failed to upload ${file.filename}`);
        });
      });
      await Promise.all(uploadPromises);
    }

    urlCollectableImages.forEach(image => {
      console.log("URL", image.url);
      console.log("Original Name:", image.originalName);
    });

    // console.log("Uploaded images:", collectableImages);
    // console.log("Original CSV:", originalCSV);
    // console.log("Edited CSV:", editedCSV);

    const originalCSVData = await parseCSV(originalCSV.path);
    console.log("originalCSVData: ", originalCSVData);

    const editedCSVData = await parseCSV(editedCSV.path);
    console.log("editedCSVData: ", editedCSVData);

    if(fs.existsSync(originalCSV.path))
      fs.unlinkSync(originalCSV.path);
    if(fs.existsSync(editedCSV.path))
      fs.unlinkSync(editedCSV.path);

    const csvDifferences = await diffCSVData(originalCSVData, editedCSVData);
    if (csvDifferences == null)
      return res.status(400).send("There is a row missing in the edited csv");
    console.log("csvDifferences: ", csvDifferences);

    console.log("Searching for collection Id");
    collectionIdQuery = await db.
      select({ collectionId: collections.collection_id })
      .from(collections)
      .where(eq(collections.collection_universe_id, collectionUniverseId))
      .execute();
    const collectionId = collectionIdQuery[0].collectionId;
    console.log("Finished Searching for collection Id");
    console.log("collectionId: ", collectionId);

    // Function to update values based on differences
    await db.transaction(async (trx) => {
      const updatePromises = csvDifferences.map(async (diff) => {
        console.log("diff.field: ", diff.field, "   diff.newValue: ", diff.newValue);
        console.log("diff.id: ", diff.id);
        let result;

        if (diff.field === 'image') {
          const imageObject = urlCollectableImages.find(image => image.originalName === diff.newValue);
          console.log("imageObject: ", imageObject.url);
          result = await trx
            .update(collectableAttributes)
            .set({
              value: imageObject.url
            })
            .where(
              and(
                eq(collectableAttributes.universe_collectable_id, diff.id),
                eq(collectableAttributes.name, diff.field)
              )
            )
            .execute();
        } else if (diff.field === 'owned') {
          const ownedBool = diff.newValue === 'T';
          if (!ownedBool) {
            console.log("Marking as unowned ", diff.id)
            await trx
              .delete(collectables)
              .where(eq(diff.id, collectables.universe_collectable_id))
              .execute();
            console.log("Marked as unowned ", diff.id);
          } else {
            console.log("Marking as owned: ", diff.id);
            await trx
              .insert(collectables)
              .values({
                collection_id: collectionId,
                universe_collectable_id: diff.id
              })
              .execute();
            console.log("Marked as owned ", diff.id);
          }

        } else if (diff.field === 'isPublished') {
          const isPublishedBool = diff.newValue === 'T';
          console.log("Setting is_published to ", isPublishedBool, " for: ", diff.id);
          await trx
            .update(universeCollectables)
            .set({ is_published: isPublishedBool })
            .where(eq(diff.id, universeCollectables.universe_collectable_id))
            .execute();
        }
        else {
          result = await trx
            .update(collectableAttributes)
            .set({
              value: diff.newValue
            })
            .where(
              and(
                eq(collectableAttributes.universe_collectable_id, diff.id),
                eq(collectableAttributes.name, diff.field)
              )
            )
            .execute();
        }

        return result;
      });

      await Promise.all(updatePromises);
      console.log('Successfully updated values based on CSV differences');


      res.status(200).send("Updated Successfully");
    })

  } catch (error) {
    console.log(error);
    res.status(400).send("Error while bulk updating");
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, defaultAttributes, universeCollectionPic } = req.body;
  try {
    const result = await db.update(collectionUniverses)
      .set({ name: name, default_attributes: defaultAttributes, universeCollectionPic: universeCollectionPic })
      .where(eq(collectionUniverses.collection_universe_id, id)).execute();
    if (result.changes === 0) {
      res.status(404).send('User not found');
    }
    res.json({ collection_universe_id: id, name, defaultAttributes, universeCollectionPic });
  }
  catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching item' });
  }
});

// DELETE
router.delete('/delete-universe', async (req, res) => {
  const { id } = req.body;

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
