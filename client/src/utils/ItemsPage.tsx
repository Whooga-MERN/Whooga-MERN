import { buildPath } from "../utils/utils";

export const fetchUniverseCollectionId = async (collectionId: string) => {
  if (!collectionId) {
    console.error("Missing collectionId", { collectionId });
    throw new Error("Missing a request parameter");
  }

  try {
    const url = `http://localhost:3000/collection/${collectionId}`;

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
    const collectables = jsonResponse
      .map((item: any) => ({
        universeCollectableId: item.universe_collectable_id,
        attributes: item.attributes.map((attr: any) => ({
          name: attr.name,
          value: attr.value,
          image: attr.slug === "image" ? attr.value : null,
        })),
      }))
      .filter((collectable: any) => {
        const nameAttr = collectable.attributes.find(
          (attr: any) => attr.name.toLowerCase() === "name"
        );
        return nameAttr && nameAttr.value && nameAttr.value.trim() !== "";
      });

    return collectables;
  } catch (e) {
    console.error(`Error thrown when fetching universe collectables: ${e}`);
    throw e;
  }
};

export const fetchOwnedCollectables = async (collectionId: string) => {
  if (!collectionId) {
    console.error("Missing collectionId", { collectionId });
    throw new Error("Missing a request parameter");
  }

  try {
    const url = `http://localhost:3000/collectable/collection/${collectionId}`;

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
    const collectables = jsonResponse
      .map((item: any) => ({
        universeCollectableId: item.universe_collectable_id,
        attributes: item.attributes.map((attr: any) => ({
          name: attr.name,
          value: attr.value,
          image: attr.slug === "image" ? attr.value : null,
        })),
      }))
      .filter((collectable: any) => {
        const nameAttr = collectable.attributes.find(
          (attr: any) => attr.name.toLowerCase() === "name"
        );
        return nameAttr && nameAttr.value && nameAttr.value.trim() !== "";
      });

    return collectables;
  } catch (e) {
    console.error(`Error thrown when fetching universe collectables: ${e}`);
    throw e;
  }
};

export const fetchUniverseSearchResults = async (
  searchterm: { attribute: string; term: string }[],
  userId: string,
  universeCollectionId: string
) => {
  if (!userId || !universeCollectionId || searchterm.length === 0) {
    console.error("Missing userId, collectionId, or search tags", {
      userId,
      universeCollectionId,
      searchterm,
    });
    throw new Error("Missing a request parameter");
  }

  const queryParams = searchterm
    .map(
      ({ attribute, term }) =>
        `attributeToSearch=${attribute
          .replace(/\s+/g, "_")
          .toLowerCase()}&searchTerm=${term}`
    )
    .join("&");

  console.log(universeCollectionId, queryParams);
  console.log(
    "universe collection search: ",
    universeCollectionId,
    queryParams
  );

  const url = `http://localhost:3000/universe-collectable-search?collectionUniverseId=${universeCollectionId}&${queryParams}`;

  console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      console.log("No matching collectables found.");
      return [];
    }

    const jsonResponse = await response.json();
    console.log("search result: ", jsonResponse);
    return jsonResponse;
  } catch (e) {
    console.error(
      `Error thrown when fetching collectable search results: ${e}`
    );
    throw e;
  }
};

export const fetchOwnedSearchResults = async (
  searchterm: { attribute: string; term: string }[],
  userId: string,
  collectionId: string
) => {
  if (!userId || !collectionId || searchterm.length === 0) {
    console.error("Missing userId, collectionId, or search tags", {
      userId,
      collectionId,
      searchterm,
    });
    throw new Error("Missing a request parameter");
  }

  const queryParams = searchterm
    .map(
      ({ attribute, term }) =>
        `attributeToSearch=${attribute
          .replace(/\s+/g, "_")
          .toLowerCase()}&searchTerm=${term}`
    )
    .join("&");

  console.log("collection search: ", collectionId, queryParams);

  const url = `http://localhost:3000/universe-collectable-search/owned?collectionId=${collectionId}&${queryParams}`;

  console.log("Request URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      return [];
    }

    const jsonResponse = await response.json();

    console.log("search result: ", jsonResponse);
    return jsonResponse;
  } catch (e) {
    console.error(
      `Error thrown when fetching collectable search results: ${e}`
    );
    throw e;
  }
};

export const addToWishlist = async (
  collectionId: string,
  universeCollectableId: number
) => {
  if (!collectionId || !universeCollectableId) {
    console.error("Missing collectionId or universeCollectableId", {
      collectionId,
      universeCollectableId,
    });
    throw new Error("Missing a request parameter");
  }

  const url = buildPath("wishlist/add-wishlist");
  console.log(url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_id: collectionId,
        universe_collectable_id: universeCollectableId,
      }),
    });

    if (response.status === 404) {
      console.error("Failed :(");
      return null;
    }

    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (e) {
    console.error(`Error thrown when adding item to wishlist: ${e}`);
    throw e;
  }
};

export const removeFromWishlist = async (
  collectionId: string,
  universeCollectableId: number
) => {
  if (!collectionId || !universeCollectableId) {
    console.error("Missing collectionId or universeCollectableId", {
      collectionId,
      universeCollectableId,
    });
    throw new Error("Missing a request parameter");
  }

  const url = buildPath("wishlist/remove-wishlist");
  console.log(url);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_id: collectionId,
        universe_collectable_id: universeCollectableId,
      }),
    });

    if (response.status === 404) {
      console.error("Failed to remove item from wishlist :(");
      return null;
    }

    const responseText = await response.text();
    return responseText;
  } catch (e) {
    console.error(`Error thrown when removing item from wishlist: ${e}`);
    throw e;
  }
};
