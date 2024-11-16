import { buildPath } from "./utils";

export const fetchCollectionSearchResults = async (
  searchTerm: string,
  userId: string
) => {
  const lowerCasedSearchTerm = searchTerm.toLowerCase();

  if (!userId || !searchTerm) {
    console.error("Missing userId or searchTerm", {
      userId,
      lowerCasedSearchTerm,
    });
    throw new Error("Missing a request parameter");
  }

  try {
    // const url = `http://localhost:3000/collection-search?userId=${userId}&searchTerm=${lowerCasedSearchTerm}`;
    const url = buildPath(
      `collection-search?userId=${userId}&searchTerm=${lowerCasedSearchTerm}`
    );
    console.log("Request URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error fetching collections.");
    }

    const jsonResponse = await response.json();
    
    /**
     * collections search result [{
        "collection_id": 151,
        "collection_pic": "https://whooga-images.s3.us-east-1.amazonaws.com/10586b65-052c-43bc-aa57-931d2dea4307-alienclub25.jpg",
        "collection_universe_id": 217,
        "custom_attributes": ["Back Color"],
        "favorite_attributes": ["Name", "tag number", "create at", "create by"],
        "hidden_attributes": null,
        "name": "Path Tags",
        "user_id": 38
      }
     */
    console.log("search result: ", jsonResponse);
    return jsonResponse;
  } catch (e) {
    console.error("Error thrown when fetching search results: ${e}");
    throw e;
  }
};
