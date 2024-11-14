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
    const {
        collectionUniverseId,
        attributeToSearch,
        searchTerm,
        page = 1,
        itemsPerPage = 8,
        sortBy,
        order = 'asc'
    } = req.query;

    if (!searchTerm || !attributeToSearch || !collectionUniverseId) {
        return res.status(400).send({ error: 'Missing a request parameter' });
    }

    const attributesToSearch = Array.isArray(attributeToSearch) ? attributeToSearch : [attributeToSearch];
    const searchTerms = Array.isArray(searchTerm) ? searchTerm : [searchTerm];

    if (attributesToSearch.length !== searchTerms.length) {
        return res.status(400).send({ error: 'Attributes and search terms must be paired.' });
    }

    try {
        // Retrieve favorite attributes for the collection
        const collectionResult = await db
            .select({ favorite_attributes: collections.favorite_attributes })
            .from(collections)
            .where(eq(collections.collection_universe_id, collectionUniverseId));

        if (collectionResult.length === 0) {
            return res.status(404).send({ error: 'Collection not found' });
        }

        const favoriteAttributes = collectionResult[0].favorite_attributes || [];

        // Retrieve matching universe collectables based on search criteria
        const matchingCollectables = await db
            .select({
                universe_collectable_id: universeCollectables.universe_collectable_id,
                attribute_name: collectableAttributes.name,
                attribute_slug: collectableAttributes.slug,
                attribute_value: collectableAttributes.value,
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

        const filteredCollectableIds = Object.keys(collectableIdsCount).filter(
            id => collectableIdsCount[id] === attributesToSearch.length
        );

        const totalMatchingCollectables = filteredCollectableIds.length;

        if (totalMatchingCollectables === 0) {
            return res.status(404).send({ error: 'No matching collectables found' });
        }

        // Fetch only favorite attributes for the filtered collectables
        const attributes = await db
            .select()
            .from(collectableAttributes)
            .where(
                and(
                    inArray(collectableAttributes.universe_collectable_id, filteredCollectableIds),
                    or(
                        inArray(collectableAttributes.name, favoriteAttributes),
                        eq(collectableAttributes.name, "image")
                      )
                )
            );

        // Map collectables with only favorite attributes, then sort them
        let collectablesWithFavoriteAttributes = filteredCollectableIds.map(universeCollectableId => {
            const relatedAttributes = attributes.filter(
                attribute => attribute.universe_collectable_id === parseInt(universeCollectableId)
            );

            return {
                universe_collectable_id: parseInt(universeCollectableId),
                attributes: relatedAttributes.map(attr => ({
                    collectable_attribute_id: attr.collectable_attribute_id,
                    name: attr.name,
                    slug: attr.slug,
                    value: attr.value,
                    is_custom: attr.is_custom
                }))
            };
        });

        if (sortBy) {
            collectablesWithFavoriteAttributes.sort((a, b) => {
                const attrA = a.attributes.find(attr => attr.slug === sortBy);
                const attrB = b.attributes.find(attr => attr.slug === sortBy);

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

        const offset = (page - 1) * itemsPerPage;
        const paginatedCollectables = collectablesWithFavoriteAttributes.slice(offset, offset + parseInt(itemsPerPage));

        res.json({ 
            totalMatchingCollectables,
            collectables: paginatedCollectables 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error fetching collectables and attributes' });
    }
});








router.get('/owned', async (req, res) => {
    const { 
        collectionId, 
        attributeToSearch, 
        searchTerm, 
        page = 1, 
        itemsPerPage = 8, 
        sortBy,           
        order = 'asc'     
    } = req.query;

    if (!searchTerm || !attributeToSearch || !collectionId) {
        return res.status(400).send({ error: 'Missing a request parameter' });
    }

    const attributesToSearch = Array.isArray(attributeToSearch) ? attributeToSearch : [attributeToSearch];
    const searchTerms = Array.isArray(searchTerm) ? searchTerm : [searchTerm];

    if (attributesToSearch.length !== searchTerms.length) {
        return res.status(400).send({ error: 'Attributes and search terms must be paired.' });
    }

    try {
        // Fetch favorite attributes for the collection
        const collectionResult = await db
            .select({ favorite_attributes: collections.favorite_attributes })
            .from(collections)
            .where(eq(collections.collection_id, collectionId));

        if (collectionResult.length === 0) {
            return res.status(404).send({ error: 'Collection not found' });
        }

        const favoriteAttributes = collectionResult[0].favorite_attributes || [];

        // Retrieve collectables that match the search criteria
        const matchingCollectables = await db
            .select({
                collectable_id: collectables.collectable_id,
                universe_collectable_id: collectables.universe_collectable_id,
                attribute_name: collectableAttributes.name,
                attribute_slug: collectableAttributes.slug,
                attribute_value: collectableAttributes.value,
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

        const filteredUniverseCollectableIds = Object.keys(universeCollectableIdsCount).filter(
            id => universeCollectableIdsCount[id] === attributesToSearch.length
        );

        const totalMatchingCollectables = filteredUniverseCollectableIds.length;

        if (totalMatchingCollectables === 0) {
            return res.status(404).send({ error: 'No matching collectables found' });
        }

        // Fetch all attributes for the filtered collectables
        const attributes = await db
            .select()
            .from(collectableAttributes)
            .where(inArray(collectableAttributes.universe_collectable_id, filteredUniverseCollectableIds));

        // Map collectables with only favorite attributes, then sort them
        let collectablesWithAttributes = filteredUniverseCollectableIds.map(universeCollectableId => {
            const relatedCollectables = matchingCollectables.filter(
                collectable => collectable.universe_collectable_id === parseInt(universeCollectableId)
            );

            const collectableId = relatedCollectables.length > 0 ? relatedCollectables[0].collectable_id : null;

            const relatedAttributes = attributes.filter(
                attribute => 
                    attribute.universe_collectable_id === parseInt(universeCollectableId) &&
                    (favoriteAttributes.includes(attribute.name) || attribute.name === "image")
            );

            return {
                collectable_id: collectableId,
                universe_collectable_id: parseInt(universeCollectableId),
                attributes: relatedAttributes.map(attr => ({
                    collectable_attribute_id: attr.collectable_attribute_id,
                    name: attr.name,
                    slug: attr.slug,
                    value: attr.value,
                    is_custom: attr.is_custom
                }))
            };
        });

        if (sortBy) {
            collectablesWithAttributes.sort((a, b) => {
                const attrA = a.attributes.find(attr => attr.slug === sortBy);
                const attrB = b.attributes.find(attr => attr.slug === sortBy);

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

















module.exports = router;