import { buildPath } from "./utils";

export const fetchCollectionSearchResults = async (
  searchTerm: string,
  userId: string
) => {
  const lowerCasedSearchTerm = searchTerm.toLowerCase();
  console.log("searchTerm: ", lowerCasedSearchTerm);

  const requestObj = { search: searchTerm, userId: userId };
  const requestBody = JSON.stringify(requestObj);
  console.log("searchRequest: ", requestBody);
  try {
    const response = await fetch(buildPath("/search"), {
      method: "POST",
      body: requestBody,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("HTTP error! status: ${response.status}");
    }

    let jsonResponse = await response.json();
    console.log("search result: ", jsonResponse);
    return jsonResponse;
  } catch (e) {
    console.error("Error thrown when fetching search results: ${e}");
    throw e;
  }
};
