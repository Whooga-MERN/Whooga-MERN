require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {collections, collectionUniverses} = require('../config/schema');
const express = require('express');
const {eq} = require('drizzle-orm');
//const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
//router.use(authenticateJWTToken);

router.get('/:collectionId', async (req, res) => {
    const { collectionId } = req.params;
    try {
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

        const combinedAttributes = [...customAttributes, ...defaultAttributes];

        console.log("combinedAttributes ", combinedAttributes);
        res.json(combinedAttributes);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

module.exports = router;