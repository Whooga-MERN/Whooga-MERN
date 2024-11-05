require("dotenv").config({ path: __dirname + "/.env" });
const { db, pool } = require('../config/db');
const { universeCollectables, collections, collectables, collectionUniverses, users, collectableAttributes } = require('../config/schema');
const express = require('express');
const { eq, ilike, and, inArray, or } = require('drizzle-orm');
// const { authenticateJWTToken } = require("../middleware/verifyJWT");

const router = express.Router();
// router.use(authenticateJWTToken);

// Universe Collectable Search APIs

router.get('', async (req, res) => {
    // Default pagination values for 1st page and items per page 8
    const { collectionUniverseId, attributeToSearch, searchTerm, page = 1, itemsPerPage = 8} = req.query;

    if (!searchTerm || !attributeToSearch || !collectionUniverseId) {
        return res.status(400).send({ error: 'Missing a request parameter' });
    }

    const attributesToSearch = Array.isArray(attributeToSearch) ? attributeToSearch : [attributeToSearch];
    const searchTerms = Array.isArray(searchTerm) ? searchTerm : [searchTerm];

    if (attributesToSearch.length !== searchTerms.length) {
        return res.status(400).send({ error: 'Attributes and search terms must be paired.' });
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
                    or(
                        ...attributesToSearch.map((attribute, index) =>
                            and(
                                eq(collectableAttributes.slug, attribute),
                                ilike(collectableAttributes.value, `%${searchTerms[index]}%`)
                            )
                        )
                    )
                )
            );

        if (matchingCollectables.length === 0) {
            return res.status(404).send({ error: 'No matching collectables found' });
        }

        const collectableIdsCount = matchingCollectables.reduce((acc, current) => {
            const id = current.universe_collectable_id;
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});

        // Filter collectables that match all conditions
        const filteredCollectableIds = Object.keys(collectableIdsCount).filter(
            id => collectableIdsCount[id] === attributesToSearch.length
        );

        if (filteredCollectableIds.length === 0) {
            return res.status(404).send({ error: 'No matching collectables found' });
        }

        // Calculate pagination values
        const offset = (page - 1) * itemsPerPage;
        const paginatedCollectableIds = filteredCollectableIds.slice(offset, offset + parseInt(itemsPerPage));

        // Fetch all attributes for the paginated collectables
        const attributes = await db
            .select()
            .from(collectableAttributes)
            .where(inArray(collectableAttributes.universe_collectable_id, paginatedCollectableIds));

        // Map the collectables with their respective attributes
        const collectablesWithAttributes = paginatedCollectableIds.map(collectableId => {
            const relatedAttributes = attributes.filter(
                attribute => attribute.universe_collectable_id === parseInt(collectableId)
            );

            return {
                universe_collectable_id: parseInt(collectableId),
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


router.get('/owned', async (req, res) => {
    // Default pagination values for 1st page and items per page 8
    const { collectionId, attributeToSearch, searchTerm, page = 1, itemsPerPage = 8 } = req.query;

    if (!searchTerm || !attributeToSearch || !collectionId) {
        return res.status(400).send({ error: 'Missing a request parameter' });
    }

    const attributesToSearch = Array.isArray(attributeToSearch) ? attributeToSearch : [attributeToSearch];
    const searchTerms = Array.isArray(searchTerm) ? searchTerm : [searchTerm];

    if (attributesToSearch.length !== searchTerms.length) {
        return res.status(400).send({ error: 'Attributes and search terms must be paired.' });
    }

    try {
        const matchingCollectables = await db
            .select({
                collectable_id: collectables.collectable_id,
                universe_collectable_id: collectables.universe_collectable_id,
                isWishlist: collectables.isWishlist
            })
            .from(collectables)
            .innerJoin(
                collectableAttributes,
                eq(collectables.universe_collectable_id, collectableAttributes.universe_collectable_id)
            )
            .where(
                and(
                    eq(collectables.collection_id, collectionId),
                    or(
                        ...attributesToSearch.map((attribute, index) =>
                            and(
                                eq(collectableAttributes.slug, attribute),
                                ilike(collectableAttributes.value, `%${searchTerms[index]}%`)
                            )
                        )
                    )
                )
            );

        if (matchingCollectables.length === 0) {
            return res.status(404).send({ error: 'No matching collectables found' });
        }


        const universeCollectableIdsCount = matchingCollectables.reduce((acc, current) => {
            const id = current.universe_collectable_id;
            if (id !== null) {
                acc[id] = (acc[id] || 0) + 1;
            }
            return acc;
        }, {});

        // Filter collectables that match all conditions
        const filteredUniverseCollectableIds = Object.keys(universeCollectableIdsCount).filter(
            id => universeCollectableIdsCount[id] === attributesToSearch.length
        );

        if (filteredUniverseCollectableIds.length === 0) {
            return res.status(404).send({ error: 'No matching collectables found' });
        }

        // Apply pagination
        const offset = (page - 1) * itemsPerPage;
        const paginatedUniverseCollectableIds = filteredUniverseCollectableIds.slice(offset, offset + parseInt(itemsPerPage));

        // Fetch all attributes for the paginated collectables
        const attributes = await db
            .select()
            .from(collectableAttributes)
            .where(inArray(collectableAttributes.universe_collectable_id, paginatedUniverseCollectableIds));

        // Map the collectables with their respective attributes
        const collectablesWithAttributes = paginatedUniverseCollectableIds.map(universeCollectableId => {
            const relatedCollectables = matchingCollectables.filter(
                collectable => collectable.universe_collectable_id === parseInt(universeCollectableId)
            );

            const collectableId = relatedCollectables.length > 0 ? relatedCollectables[0].collectable_id : null;

            const relatedAttributes = attributes.filter(
                attribute => attribute.universe_collectable_id === parseInt(universeCollectableId)
            );

            return {
                collectable_id: collectableId,
                universe_collectable_id: parseInt(universeCollectableId),
                isWishlist: relatedCollectables.length > 0 ? relatedCollectables[0].isWishlist : false,
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