require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {collections, collectionUniverses} = require('../config/schema');
const express = require('express');
const {eq} = require('drizzle-orm');

const router = express.Router();

router.get('/:id', async (req, res) => {
    const collectionId = parseInt(req.params.id);
    try {
      const result = await db.select().from(collections).innerJoin
      (collectionUniverses, eq(collections.collection_universe_id, collectionUniverses.collection_universe_id)).where
      (eq(collections.collection_id, collectionId));
      /*const result = await db.(`
        SELECT * 
        FROM collections 
        INNER JOIN collectionUniverses 
        ON collections.collection_universe_id = collectionUniverses.collection_universe_id 
        WHERE collections.collection_id = ${collectionId}
      `);*/
  
      if (result.length === 0) {
        return res.status(404).json({ message: 'Collection not found' });
      }
  
      // Extracting custom_attributes and default_attributes
      const response = result.map(item => ({
        default_attributes: item.collectionUniverses.default_attributes,
        custom_attributes: item.collections.custom_attributes,
      }));
  
      const firstItem = result[0];
      const combinedAttributes = {
        ...firstItem.collectionUniverses.default_attributes,
        ...firstItem.collections.custom_attributes,
      };
  
      res.json(combinedAttributes);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  module.exports = router;