require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const { universeCollectables, collections, collectionUniverses, users, collectableAttributes } = require('../config/schema');
const express = require('express');
const { eq, ilike, and, inArray } = require('drizzle-orm');
// const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
// router.use(authenticateJWTToken);

// Universe Collectable Search APIs

router.get('', async (req, res) => {
    const { collectionUniverseId, attributeToSearch, searchTerm } = req.query;

    if (!searchTerm || !attributeToSearch || !collectionUniverseId) {
        return res.status(400).send({ error: 'Missing a request parameter' });
    }

    try {
        
        const matchingCollectables = await db
            .select({
                universe_collectable_id: universeCollectables.universe_collectable_id
            })
            .from(universeCollectables)
            .innerJoin(
                collectableAttributes,
                eq(universeCollectables.universe_collectable_id, collectableAttributes.universe_collectable_id)
            )
            .where(
                and(
                    eq(universeCollectables.collection_universe_id, collectionUniverseId),
                    eq(collectableAttributes.slug, attributeToSearch),
                    ilike(collectableAttributes.value, `%${searchTerm}%`)
                )
            );

        if (matchingCollectables.length === 0) {
            return res.status(404).send({ error: 'No matching collectables found' });
        }

        
        const collectableIds = matchingCollectables.map(c => c.universe_collectable_id);

        
        const attributes = await db
            .select()
            .from(collectableAttributes)
            .where(inArray(collectableAttributes.universe_collectable_id, collectableIds));

        
        const collectablesWithAttributes = collectableIds.map(collectableId => {
            const relatedAttributes = attributes.filter(
                attribute => attribute.universe_collectable_id === collectableId
            );

            return {
                universe_collectable_id: collectableId,
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


module.exports = router;