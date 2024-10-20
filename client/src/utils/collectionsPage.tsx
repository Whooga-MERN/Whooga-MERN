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
    // console.log("search result: ", jsonResponse);
    return jsonResponse;
  } catch (e) {
    console.error("Error thrown when fetching search results: ${e}");
    throw e;
  }
};
