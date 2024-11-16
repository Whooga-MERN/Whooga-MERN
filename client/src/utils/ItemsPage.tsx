import { buildPath } from "../utils/utils";

export const fetchUniverseCollectionId = async (collectionId: string) => {
  if (!collectionId) {
    console.error("Missing collectionId", { collectionId });
    throw new Error("Missing a request parameter");
  }

  try {
    const url = buildPath(`collection/${collectionId}`);

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
    return universeCollectionId;
  } catch (e) {
    console.error(`Error thrown when fetching universe collection ID: ${e}`);
    throw e;
  }
};

export const fetchUniverseCollectables = async (
  universeCollectionId: string,
  page: number,
  itemsPerPage: number,
  sortBy: string,
  sortOrder: string
) => {
  if (!universeCollectionId) {
    console.error("Missing universeCollectionId", { universeCollectionId });
    throw new Error("Missing a request parameter");
  }

  const handleSortBy = sortBy.replace(/\s+/g, "_");

  try {
    const url = buildPath(
      `universe-collectable/universe-collection-paginated/${universeCollectionId}?page=${page}&itemsPerPage=${itemsPerPage}&sortBy=${handleSortBy}&order=${sortOrder}`
    );

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
    const totalMatchingCollectables =
      jsonResponse.totalMatchingCollectables || 0;

    const collectables = jsonResponse.collectables
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

    return {
      collectables,
      totalMatchingCollectables,
    };
  } catch (e) {
    console.error(`Error thrown when fetching universe collectables: ${e}`);
    throw e;
  }
};

export const fetchOwnedCollectables = async (
  collectionId: string,
  page: number,
  itemsPerPage: number,
  sortBy: string,
  sortOrder: string
) => {
  if (!collectionId) {
    console.error("Missing collectionId", { collectionId });
    throw new Error("Missing a request parameter");
  }

  const handleSortBy = sortBy.replace(/\s+/g, "_");

  try {
    const url = buildPath(
      `collectable/collection-paginated/${collectionId}?page=${page}&itemsPerPage=${itemsPerPage}&sortBy=${handleSortBy}&order=${sortOrder}`
    );

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

    const collectables = jsonResponse.collectables
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

    return {
      collectables,
      totalMatchingCollectables: jsonResponse.totalMatchingCollectables,
    };
  } catch (e) {
    console.error(`Error thrown when fetching universe collectables: ${e}`);
    throw e;
  }
};

export const fetchUniverseSearchResults = async (
  searchterm: { attribute: string; term: string }[],
  userId: string,
  universeCollectionId: string,
  page: number,
  sortBy: string,
  sortOrder: string
) => {
  if (!userId || !universeCollectionId || searchterm.length === 0) {
    console.error("Missing userId, collectionId, or search tags", {
      userId,
      universeCollectionId,
      searchterm,
    });
    throw new Error("Missing a request parameter");
  }

  const handleSortBy = sortBy.replace(/\s+/g, "_");

  const queryParams = searchterm
    .map(
      ({ attribute, term }) =>
        `attributeToSearch=${attribute
          .replace(/\s+/g, "_")
          .toLowerCase()}&searchTerm=${term}`
    )
    .join("&");

  const url = buildPath(
    `universe-collectable-search?collectionUniverseId=${universeCollectionId}&${queryParams}&page=${page}&itemsPerPage=12&sortBy=${handleSortBy}&order=${sortOrder}`
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      console.log("No matching collectables found.");
      return { collectables: [], totalMatchingCollectables: 0 };
    }

    const jsonResponse = await response.json();
    return {
      collectables: jsonResponse.collectables,
      totalMatchingCollectables: jsonResponse.totalMatchingCollectables,
    };
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
  collectionId: string,
  page: number,
  sortBy: string,
  sortOrder: string
) => {
  if (!userId || !collectionId || searchterm.length === 0) {
    console.error("Missing userId, collectionId, or search tags", {
      userId,
      collectionId,
      searchterm,
    });
    throw new Error("Missing a request parameter");
  }

  const handleSortBy = sortBy.replace(/\s+/g, "_");

  const queryParams = searchterm
    .map(
      ({ attribute, term }) =>
        `attributeToSearch=${attribute
          .replace(/\s+/g, "_")
          .toLowerCase()}&searchTerm=${term}`
    )
    .join("&");

  const url = buildPath(
    `universe-collectable-search/owned?collectionId=${collectionId}&${queryParams}&page=${page}&itemsPerPage=12&sortBy=${handleSortBy}&order=${sortOrder}`
  );

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
  universeCollectableId: number,
  sourceAttributesString: string
) => {
  if (!collectionId || !universeCollectableId || !sourceAttributesString) {
    console.error("Missing collectionId or universeCollectableId or sourceAttributesString", {
      collectionId,
      universeCollectableId,
      sourceAttributesString,
    });
    throw new Error("Missing a request parameter");
  }

  const url = buildPath("wishlist/add-wishlist");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_universe_id: collectionId,
        universe_collectable_id: universeCollectableId,
        sourceAttributesString: sourceAttributesString,
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

export const fetchUniverseJumpResults = async (
  searchTerm: { attribute: string; term: string }[],
  userId: string,
  universeCollectionId: string,
  sortBy: string,
  sortOrder: string
) => {
  if (!userId || !universeCollectionId || searchTerm.length === 0) {
    console.error("Missing userId, collectionId, or search tags", {
      userId,
      universeCollectionId,
      searchTerm,
    });
    throw new Error("Missing a request parameter");
  }

  const handleSortBy = sortBy.replace(/\s+/g, "_");

  const queryParams = searchTerm
    .map(
      ({ attribute, term }) =>
        `attributeToSearch=${encodeURIComponent(
          attribute.replace(/\s+/g, "_").toLowerCase()
        )}&searchTerm=${encodeURIComponent(term)}`
    )
    .join("&");

  const url = buildPath(
    `universe-collectable/jump?collectionUniverseId=${universeCollectionId}&${queryParams}&itemsPerPage=12&sortBy=${handleSortBy}&order=${sortOrder}`
  );

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
    return jsonResponse;
  } catch (e) {
    console.error(`Error thrown when fetching jump search results: ${e}`);
    throw e;
  }
};
