export const fetchUniverseCollectionId = async (collectionId: string) => {
  if (!collectionId) {
    console.error("Missing collectionId", { collectionId });
    throw new Error("Missing a request parameter");
  }

  try {
    const url = `http://localhost:3000/collection/${collectionId}`;
    console.log("Request URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error fetching collection.");
    }

    const jsonResponse = await response.json();
    console.log("search result: ", jsonResponse);

    const universeCollectionId = jsonResponse.collection_universe_id;
    console.log("Universe Collection ID:", universeCollectionId);
    return universeCollectionId;
  } catch (e) {
    console.error(`Error thrown when fetching universe collection ID: ${e}`);
    throw e;
  }
};

export const fetchUniverseCollectables = async (
  universeCollectionId: string
) => {
  if (!universeCollectionId) {
    console.error("Missing universeCollectionId", { universeCollectionId });
    throw new Error("Missing a request parameter");
  }

  try {
    const url = `http://localhost:3000/universe-collectable/universe-collection/${universeCollectionId}`;
    console.log("Request URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Error fetching universe collectables."
      );
    }

    const jsonResponse = await response.json();
    console.log("Search result:", jsonResponse);

    const collectables = jsonResponse.map((item: any) => ({
      universeCollectableId: item.universe_collectable_id,
      attributes: item.attributes.map((attr: any) => ({
        name: attr.name,
        value: attr.value,
        image: attr.slug === "image" ? attr.value : null,
      })),
    }));

    console.log("Universe Collectables with Attributes:", collectables);
    return collectables;
  } catch (e) {
    console.error(`Error thrown when fetching universe collectables: ${e}`);
    throw e;
  }
};
