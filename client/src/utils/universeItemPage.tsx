import { buildPath } from "../utils/utils";

export const fetchPublicUniverseCollectables = async (
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
      `universe-collectable/universe-collection-paginated-published/${universeCollectionId}?page=${page}&itemsPerPage=${itemsPerPage}&sortBy=${handleSortBy}&order=${sortOrder}`
    );
    console.log("here: ", url);

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

export const fetchPublicUniverseSearchResults = async (
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
    `universe-collectable-search/published?collectionUniverseId=${universeCollectionId}&${queryParams}&page=${page}&itemsPerPage=12&sortBy=${handleSortBy}&order=${sortOrder}`
  );
  console.log("publicSearch: ", url);

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

export const fetchPublicUniverseJumpResults = async (
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
    `universe-collectable/jump-published?collectionUniverseId=${universeCollectionId}&${queryParams}&itemsPerPage=12&sortBy=${handleSortBy}&order=${sortOrder}`
  );
  console.log("pubicJump: ", url);

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
