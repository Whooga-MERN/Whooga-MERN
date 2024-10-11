import { buildPath } from "./utils";

export const fetchSearchResults = async (
  // attribute: string,
  // searchTerm: string,
  tags: { attribute: string; term: string }[],
  userId: string,
  collectionId: string
) => {
  console.log("userid: ", userId);
  console.log("conllectionid: ", collectionId);

  // collectionId
  const requestObj = { tags, userId, collectionId };
  const requestBody = JSON.stringify(requestObj);
  // const requestObj = { attribute, search: searchTerm, userId };
  // const requestBody = JSON.stringify(requestObj);
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
