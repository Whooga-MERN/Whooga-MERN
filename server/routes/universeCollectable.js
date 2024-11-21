require("dotenv").config({ path: __dirname + "/.env" });
const {db, pool} = require('../config/db');
const {universeCollectables, collectableAttributes, collectables, collections} = require('../config/schema');
const express = require('express');
const { eq, and, inArray, or, ilike } = require('drizzle-orm');

const router = express.Router();

// Universe Collectable CRUD APIs

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


// Create
router.post('', async (req, res) => {
    const {collectionUniverseId, universeCollectableId, typeId, name, universeCollectablePic} = req.body;

    if (!collectionUniverseId || !collectableType || !typeId || !name || !universeCollectablePic) {
        return res.status(400).send({ error: 'Request body is missing a parameter' });
    }

    try {
        const newItem = await db.insert(universeCollectables).values({
            collection_universe_id: collectionUniverseId,
            collectable_type: collectableType,
            type_id: typeId,
            name: name,
            universeCollectablePic: universeCollectablePic
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
    const allItems = await db.select().from(universeCollectables).execute();
    res.json(allItems);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching items' });
  }
});

// READ (Single item)

router.get('/published-collectables/:collectionUniverseId', async (req, res) => {
  const { collectionUniverseId } = req.params;

  if(!collectionUniverseId || isNaN(collectionUniverseId)) {
    console.log("collectionUniverseId is invalid: ", collectionUniverseId);
    return res.status(404).send("universeCollectionId is invalid");
  }
  console.log("collectionUniverseId: ". collectionUniverseId);

  try {
    console.log("Fetching all published collectables");
    const publishedCollectables = await db
      .select({collectableId: universeCollectables.universe_collectable_id})
      .from(universeCollectables)
      .where(
          and(
            eq(collectionUniverseId, universeCollectables.collection_universe_id),
            eq(universeCollectables.is_published, true)
          )
        )
      .execute();

    console.log("Finished Fetching all published collectables");

    res.status(200).json(publishedCollectables);
  } catch (error) {
    console.log("Failed Fetching published collectables");
    console.log(error);
    res.status(400).send("Failed fetching publisehd collectables");
  }

});


router.get('/single-collectable/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const item = await db.select()
      .from(universeCollectables)
      .where(eq(id, universeCollectables.universe_collectable_id))
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

router.get('/universe-collection/:universe_collection_id', async (req, res) => {
  const { universe_collection_id } = req.params;

  try {
    const fetchedUniverseCollectables = await db
      .select()
      .from(universeCollectables)
      .where(eq(universeCollectables.collection_universe_id, universe_collection_id));

    if (fetchedUniverseCollectables.length === 0) {
      return res.status(404).send({ error: 'No collectables found in this collection' });
    }
    const collectableIds = fetchedUniverseCollectables.map(c => c.universe_collectable_id);

    const ownedCollectables = await db
      .select()
      .from(collectables)
      .where(inArray(collectables.universe_collectable_id,collectableIds));

    const ownedSet = new Set(ownedCollectables.map(row => row.universe_collectable_id));

    const attributes = await db
      .select()
      .from(collectableAttributes)
      .where(inArray(collectableAttributes.universe_collectable_id, collectableIds));

    const collectablesWithAttributes = fetchedUniverseCollectables.map(collectable => {
      const relatedAttributes = attributes.filter(
        attribute => attribute.universe_collectable_id === collectable.universe_collectable_id
      );

      return {
        ...collectable,
        owned: ownedSet.has(collectable.universe_collectable_id),
        attributes: relatedAttributes.map(attr => ({
          collectable_attribute_id: attr.collectable_attribute_id,
          name: attr.name,
          slug: attr.slug,
          value: attr.value,
          is_custom: attr.is_custom
        }))
      };
    });
    
    res.status(200).json(collectablesWithAttributes);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching collectables and attributes' });
  }
});

router.get('/universe-collection-paginated/:universe_collection_id', async (req, res) => {
  const { universe_collection_id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = parseInt(req.query.itemsPerPage) || 8;
  const sortBy = req.query.sortBy;
  const order = req.query.order || 'asc';


  const sortBySlug = makeSlug(sortBy);

  try {
      // Retrieve favorite attributes for the collection
      const collectionResult = await db
          .select({ favorite_attributes: collections.favorite_attributes })
          .from(collections)
          .where(eq(collections.collection_universe_id, universe_collection_id));

      if (collectionResult.length === 0) {
          return res.status(404).send({ error: 'Collection not found' });
      }

      const favoriteAttributes = collectionResult[0].favorite_attributes || [];

      // Fetch the collectables for the specified universe collection
      const fetchedUniverseCollectables = await db
          .select()
          .from(universeCollectables)
          .where(eq(universeCollectables.collection_universe_id, universe_collection_id));

      if (fetchedUniverseCollectables.length === 0) {
          return res.status(404).send({ error: 'No collectables found in this collection' });
      }

      // Get the list of collectable IDs for attribute fetching
      const collectableIds = fetchedUniverseCollectables.map(c => c.universe_collectable_id);

      // Fetch attributes for the collectables, filtering to include only favorite attributes
      const attributes = await db
          .select()
          .from(collectableAttributes)
          .where(
              or(
                and(
                  inArray(collectableAttributes.universe_collectable_id, collectableIds),
                  or(
                    inArray(collectableAttributes.name, favoriteAttributes),
                    eq(collectableAttributes.name, "image")
                  )
                )
              )
          );

     // Map the collectables with sorted attributes
    let collectablesWithFavoriteAttributes = fetchedUniverseCollectables.map(collectable => {
        const relatedAttributes = attributes
            .filter(attribute => attribute.universe_collectable_id === collectable.universe_collectable_id)
            .map(attr => ({
                collectable_attribute_id: attr.collectable_attribute_id,
                name: attr.name,
                slug: attr.slug,
                value: attr.value,
                is_custom: attr.is_custom
            }));
        
        // Sort attributes: image first, then by favoriteAttributes order
        const sortedAttributes = relatedAttributes.sort((a, b) => {
            if (a.name === 'image') return -1; // 'image' goes to the top
            if (b.name === 'image') return 1;  // 'image' goes to the top

            const indexA = favoriteAttributes.indexOf(a.name);
            const indexB = favoriteAttributes.indexOf(b.name);


            return (
                (indexA === -1 ? Number.MAX_VALUE : indexA) -
                (indexB === -1 ? Number.MAX_VALUE : indexB)
            );
        });

        return {
            ...collectable,
            attributes: sortedAttributes
        };
    });


      // Apply sorting if sortBy parameter is provided
      if (sortBySlug) {
          collectablesWithFavoriteAttributes.sort((a, b) => {
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
      const totalMatchingCollectables = collectablesWithFavoriteAttributes.length;

      // Apply pagination
      const offset = (page - 1) * itemsPerPage;
      const paginatedCollectables = collectablesWithFavoriteAttributes.slice(offset, offset + itemsPerPage);

      // Return the total matching collectables, current page, and paginated/sorted collectables
      res.json({
          totalMatchingCollectables,
          page,
          collectables: paginatedCollectables
      });
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error fetching collectables and attributes' });
  }
});

router.get('/universe-collection-paginated-published/:universe_collection_id', async (req, res) => {
  const { universe_collection_id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = parseInt(req.query.itemsPerPage) || 8;
  const sortBy = req.query.sortBy;
  const order = req.query.order || 'asc';

  const sortBySlug = makeSlug(sortBy);

  try {
      // Retrieve favorite attributes for the collection
      const collectionResult = await db
          .select({ favorite_attributes: collections.favorite_attributes })
          .from(collections)
          .where(eq(collections.collection_universe_id, universe_collection_id));

      if (collectionResult.length === 0) {
          return res.status(404).send({ error: 'Collection not found' });
      }

      const favoriteAttributes = collectionResult[0].favorite_attributes || [];

      // Fetch the collectables for the specified universe collection
      const fetchedUniverseCollectables = await db
          .select()
          .from(universeCollectables)
          .where(
            and(
              eq(universeCollectables.collection_universe_id, universe_collection_id),
              eq(universeCollectables.is_published, true)
            )
          );

      if (fetchedUniverseCollectables.length === 0) {
          return res.status(404).send({ error: 'No collectables found in this collection' });
      }

      // Get the list of collectable IDs for attribute fetching
      const collectableIds = fetchedUniverseCollectables.map(c => c.universe_collectable_id);

      // Fetch attributes for the collectables, filtering to include only favorite attributes
      const attributes = await db
          .select()
          .from(collectableAttributes)
          .where(
              or(
                and(
                  inArray(collectableAttributes.universe_collectable_id, collectableIds),
                  or(
                    inArray(collectableAttributes.name, favoriteAttributes),
                    eq(collectableAttributes.name, "image")
                  )
                )
              )
          );

       // Map the collectables with sorted attributes
    let collectablesWithFavoriteAttributes = fetchedUniverseCollectables.map(collectable => {
      const relatedAttributes = attributes
          .filter(attribute => attribute.universe_collectable_id === collectable.universe_collectable_id)
          .map(attr => ({
              collectable_attribute_id: attr.collectable_attribute_id,
              name: attr.name,
              slug: attr.slug,
              value: attr.value,
              is_custom: attr.is_custom
          }));
      
      // Sort attributes: image first, then by favoriteAttributes order
      const sortedAttributes = relatedAttributes.sort((a, b) => {
          if (a.name === 'image') return -1; // 'image' goes to the top
          if (b.name === 'image') return 1;  // 'image' goes to the top

          const indexA = favoriteAttributes.indexOf(a.name);
          const indexB = favoriteAttributes.indexOf(b.name);


          return (
              (indexA === -1 ? Number.MAX_VALUE : indexA) -
              (indexB === -1 ? Number.MAX_VALUE : indexB)
          );
      });

      return {
          ...collectable,
          attributes: sortedAttributes
      };
  });


      // Apply sorting if sortBy parameter is provided
      if (sortBySlug) {
          collectablesWithFavoriteAttributes.sort((a, b) => {
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
      const totalMatchingCollectables = collectablesWithFavoriteAttributes.length;

      // Apply pagination
      const offset = (page - 1) * itemsPerPage;
      const paginatedCollectables = collectablesWithFavoriteAttributes.slice(offset, offset + itemsPerPage);

      // Return the total matching collectables, current page, and paginated/sorted collectables
      res.json({
          totalMatchingCollectables,
          page,
          collectables: paginatedCollectables
      });
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error fetching collectables and attributes' });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, universeCollectablePic } = req.body;
  try {
    const result = await db.update(universeCollectables)
      .set({name: name, universeCollectablePic: universeCollectablePic})
      .where(eq(universeCollectables.universe_collectable_id, id)).execute();
    if (result.changes === 0)
    {
      res.status(404).send('User not found');
    }
    res.json({universe_collectable_id_id: id, name, universeCollectablePic});
  }
  catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error fetching item' });
  }
});

router.delete('/delete-universe-collectable', async (req, res) => {
  const { universeCollectableId } = req.body;

  if(!universeCollectableId || isNaN(universeCollectableId))
    return res.status(404).send('No or improper universeCollectableId given');
  console.log("universeCollectableId: ", universeCollectableId);

  try {
    console.log("\nStarting Deletion of universeCollecatble");
    const deletedUniverseCollectable = await db
      .delete(universeCollectables)
      .where(eq(universeCollectableId, universeCollectables.universe_collectable_id))
      .returning();
  
    console.log("deletedUniverseCollectable.length: ", deletedUniverseCollectable.length);
    if(deletedUniverseCollectable.length < 1) {
      console.log("No Collecatble found to delete")
      return res.status(404).send("No Collectable found to delete");
    }
  
    return res.status(200).send("Successfully deleted universeCollectable");
  } catch (error) {
    console.log("Failed to delete collectable");
    console.log(error);
    return res.status(400).send("Error deleting collectable");
  }
});

router.get('/jump', async (req, res) => {
  const { collectionUniverseId, attributeToSearch, searchTerm, itemsPerPage = 8, sortBy, order = 'asc' } = req.query;

  if (!searchTerm || !attributeToSearch || !collectionUniverseId) {
      return res.status(400).send({ error: 'Missing a request parameter' });
  }

  const sortBySlug = makeSlug(sortBy);

  const attributesToSearch = Array.isArray(attributeToSearch) ? attributeToSearch : [attributeToSearch];
  const searchTerms = Array.isArray(searchTerm) ? searchTerm : [searchTerm];

  // Call makeSlug for each attribute
  attributesToSearch.forEach((attribute, index, array) => {
    array[index] = makeSlug(attribute); // Update each attribute in the array with its slugified version
});

  if (attributesToSearch.length !== searchTerms.length) {
      return res.status(400).send({ error: 'Attributes and search terms must be paired.' });
  }

  try {
      // Fetch all collectables in the collection universe and their attributes
      const allCollectables = await db
          .select({
              universe_collectable_id: universeCollectables.universe_collectable_id,
          })
          .from(universeCollectables)
          .where(eq(universeCollectables.collection_universe_id, collectionUniverseId));

      // Fetch all attributes for the collectables in the collection
      const allAttributes = await db
          .select()
          .from(collectableAttributes)
          .where(inArray(collectableAttributes.universe_collectable_id, allCollectables.map(c => c.universe_collectable_id)));

      // Map collectables with their attributes
      let collectablesWithAttributes = allCollectables.map(collectable => {
          const relatedAttributes = allAttributes.filter(
              attribute => attribute.universe_collectable_id === collectable.universe_collectable_id
          );

          return {
              universe_collectable_id: collectable.universe_collectable_id,
              attributes: relatedAttributes.map(attr => ({
                  collectable_attribute_id: attr.collectable_attribute_id,
                  name: attr.name,
                  slug: attr.slug,
                  value: attr.value,
                  is_custom: attr.is_custom
              }))
          };
      });

      // Sort the entire collection based on the requested attribute
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

      // Filter the collectables based on search term and attribute
      const filteredCollectables = collectablesWithAttributes.filter(collectable => {
          return attributesToSearch.every((attribute, index) => {
              return collectable.attributes.some(attr =>
                  attr.slug === attribute && attr.value.toLowerCase().includes(searchTerms[index].toLowerCase())
              );
          });
      });

      if (filteredCollectables.length === 0) {
          return res.status(404).send({ error: 'No matching collectables found' });
      }

      // Find the first matching collectable's index in the sorted collection
      const firstMatchId = filteredCollectables[0].universe_collectable_id;
      const firstMatchIndex = collectablesWithAttributes.findIndex(
          collectable => collectable.universe_collectable_id === firstMatchId
      );

      if (firstMatchIndex === -1) {
          return res.status(404).send({ error: 'First match not found in overall collection' });
      }

      // Calculate the page number where the first matching collectable is located
      const pageNumber = Math.floor(firstMatchIndex / itemsPerPage) + 1;

      // Return the universe_collectable_id and the calculated page number
      res.status(200).send({
          universe_collectable_id: firstMatchId,
          pageNumber: pageNumber
      });

  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error fetching collectables and attributes' });
  }
});

router.get('/jump-published', async (req, res) => {
  const { collectionUniverseId, attributeToSearch, searchTerm, itemsPerPage = 8, sortBy, order = 'asc' } = req.query;

  if (!searchTerm || !attributeToSearch || !collectionUniverseId) {
      return res.status(400).send({ error: 'Missing a request parameter' });
  }

  const sortBySlug = makeSlug(sortBy);

  const attributesToSearch = Array.isArray(attributeToSearch) ? attributeToSearch : [attributeToSearch];
  const searchTerms = Array.isArray(searchTerm) ? searchTerm : [searchTerm];

  // Call makeSlug for each attribute
  attributesToSearch.forEach((attribute, index, array) => {
    array[index] = makeSlug(attribute); // Update each attribute in the array with its slugified version
});

  if (attributesToSearch.length !== searchTerms.length) {
      return res.status(400).send({ error: 'Attributes and search terms must be paired.' });
  }

  try {
      // Fetch all collectables in the collection universe and their attributes
      const allCollectables = await db
          .select({
              universe_collectable_id: universeCollectables.universe_collectable_id,
          })
          .from(universeCollectables)
          .where(and(
            eq(universeCollectables.collection_universe_id, collectionUniverseId),
            eq(universeCollectables.is_published, true)
          ));

      // Fetch all attributes for the collectables in the collection
      const allAttributes = await db
          .select()
          .from(collectableAttributes)
          .where(inArray(collectableAttributes.universe_collectable_id, allCollectables.map(c => c.universe_collectable_id)));

      // Map collectables with their attributes
      let collectablesWithAttributes = allCollectables.map(collectable => {
          const relatedAttributes = allAttributes.filter(
              attribute => attribute.universe_collectable_id === collectable.universe_collectable_id
          );

          return {
              universe_collectable_id: collectable.universe_collectable_id,
              attributes: relatedAttributes.map(attr => ({
                  collectable_attribute_id: attr.collectable_attribute_id,
                  name: attr.name,
                  slug: attr.slug,
                  value: attr.value,
                  is_custom: attr.is_custom
              }))
          };
      });

      // Sort the entire collection based on the requested attribute
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

      // Filter the collectables based on search term and attribute
      const filteredCollectables = collectablesWithAttributes.filter(collectable => {
          return attributesToSearch.every((attribute, index) => {
              return collectable.attributes.some(attr =>
                  attr.slug === attribute && attr.value.toLowerCase().includes(searchTerms[index].toLowerCase())
              );
          });
      });

      if (filteredCollectables.length === 0) {
          return res.status(404).send({ error: 'No matching collectables found' });
      }

      // Find the first matching collectable's index in the sorted collection
      const firstMatchId = filteredCollectables[0].universe_collectable_id;
      const firstMatchIndex = collectablesWithAttributes.findIndex(
          collectable => collectable.universe_collectable_id === firstMatchId
      );

      if (firstMatchIndex === -1) {
          return res.status(404).send({ error: 'First match not found in overall collection' });
      }

      // Calculate the page number where the first matching collectable is located
      const pageNumber = Math.floor(firstMatchIndex / itemsPerPage) + 1;

      // Return the universe_collectable_id and the calculated page number
      res.status(200).send({
          universe_collectable_id: firstMatchId,
          pageNumber: pageNumber
      });

  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Error fetching collectables and attributes' });
  }
});















module.exports = router;