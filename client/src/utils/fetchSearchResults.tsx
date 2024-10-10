import { buildPath } from "./utils";

export const fetchSearchResults = async (
  attribute: string,
  searchTerm: string
) => {
  const lowerCaseAttribute = attribute.toLowerCase();
  const lowerCasedSearchTerm = searchTerm.toLowerCase();
  console.log("attribute: ", lowerCaseAttribute);
  console.log("searchTerm: ", lowerCasedSearchTerm);

  const requestObj = { attribute, search: searchTerm };
  const requestBody = JSON.stringify(requestObj);
  console.log("SEARCH request: ", requestBody);
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
