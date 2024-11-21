import { useEffect, useState } from "react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Collection } from "../Types/Collection";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import fetchJWT from "../fetchJWT";
import { Link, useParams } from "react-router-dom";
import { buildPath } from "../utils/utils";

function WishlistItems() {
  const [user, setUser] = useState<any>(null);
  const [JWT, setJWT] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isUserFetched, setIsUserFetched] = useState(false);
  const [isTokenFetched, setIsTokenFetched] = useState(false);
  const [isUserIdFetched, setIsUserIdFetched] = useState(false);
  const [collectionName, setCollectionName] = useState<string>("");

  const { collectionUniverseId } = useParams<{
    collectionUniverseId: string;
  }>();

  const [myScrapedWishlistItems, setMyScrapedWishlistItems] =
    useState<WishlistItemsState>({ collectionUniverseId: "", items: [] });
  const [myMatches, setMyMatches] = useState<WishlistItemsState>({
    collectionUniverseId: "",
    items: [],
  });
  const [relatedWishlistItems, setRelatedWishlistItems] =
    useState<WishlistItemsState>({ collectionUniverseId: "", items: [] });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const user = await fetchUserLoginDetails();
        setUser(user || "");
        setIsUserFetched(true);
      } catch (error) {
        console.error("Error Fetching User");
      }
    };
    fetchUserDetails();

    const fetchToken = async () => {
      try {
        const token = await fetchJWT();
        setJWT(token || "");
        setIsTokenFetched(true);
      } catch (error) {
        console.error("Error fetching JWT");
      }
    };
    fetchToken();
    //console.log(JWT);
  }, []);

  useEffect(() => {
    if (isUserFetched && isTokenFetched && user && JWT) {
      const getUserId = async () => {
        const params = {
          user_email: user.loginId,
        };

        const response = await fetch(
          // "http://localhost:3000/user/?user_email=" + user.loginId,
          buildPath(`user/?user_email=${user.loginId}`),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
        const data = await response.json();
        setUserId(data[0].user_id);
        setIsUserIdFetched(true);
      };
      getUserId();
    }
  }, [isUserFetched, isTokenFetched, user, JWT]);

  // ------------------ fetch wishlist items ----------------------
  useEffect(() => {
    const storedName = localStorage.getItem("collectionName");
    console.log(
      "collectionUniverseId @wishlist_items.tsx:",
      collectionUniverseId
    );
    setCollectionName(storedName ? storedName : "");
  }, []);

  interface WishlistItem {
    title: string;
    price: string;
    link: string;
    image_url: string;
  }

  interface WishlistItemsState {
    collectionUniverseId: string;
    items: WishlistItem[];
  }

  const fetchWishlistItems = async (collectionUniverseId: number) => {
    // fetch all scraped Items
    try {
      // fetch items for collection
      const response = await fetch(
        // `http://localhost:3000/wishlist/whooga-alert/my-wishlisted/${collectionUniverseId}`
        // `http://localhost:3000/wishlist/whooga-alert/my-wishlisted/113`
        buildPath(
          `wishlist/whooga-alert/my-wishlisted/${collectionUniverseId}`
        ),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      // if no wishlist items, return empty array
      if (!response.ok) {
        const result = {
          collectionUniverseId: collectionUniverseId.toString(),
          items: [],
        };
        console.log("No wishlist items for collection:", collectionUniverseId);
        setMyScrapedWishlistItems(result);
      }

      const data = await response.json();
      const result = {
        collectionUniverseId: collectionUniverseId.toString(),
        items: data.length > 0 ? data : [],
      };

      console.log("Items Scraped for collection:", result);

      setMyScrapedWishlistItems(result);
    } catch (error) {
      console.error("Error fetching wishlisted items:", error);
    }

    // fetch Matched items
    try {
      // fetch items for collection
      const response = await fetch(
        // `http://localhost:3000/wishlist/whooga-alert/my-wishlisted/${collectionUniverseId}`
        // `http://localhost:3000/wishlist/whooga-alert/my-wishlisted/113`
        buildPath(
          `wishlist/whooga-alert/my-wishlisted-matches/${collectionUniverseId}`
        ),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      // if no wishlist items, return empty array
      if (!response.ok) {
        const result = {
          collectionUniverseId: collectionUniverseId.toString(),
          items: [],
        };
        console.log("No wishlist items for collection:", collectionUniverseId);
        setMyMatches(result);
      }

      const data = await response.json();
      const result = {
        collectionUniverseId: collectionUniverseId.toString(),
        items: data.length > 0 ? data : [],
      };

      console.log("Matched Items for collection:", result);

      setMyMatches(result);
    } catch (error) {
      console.error("Error fetching wishlisted items:", error);
    }

    // fetch related items
    try {
      // fetch items for collection
      const response = await fetch(
        // `http://localhost:3000/wishlist/whooga-alert/related-wishlisted/${collectionUniverseId}`
        //`http://localhost:3000/wishlist/whooga-alert/related-wishlisted/113`
        buildPath(
          `wishlist/whooga-alert/related-wishlist/${collectionUniverseId}`
        ),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      // if no wishlist items, return empty array
      if (!response.ok) {
        const result = {
          collectionUniverseId: collectionUniverseId.toString(),
          items: [],
        };
        console.log(
          "No related wishlist items for collection:",
          collectionUniverseId
        );
        setRelatedWishlistItems(result);
      }

      const data = await response.json();
      const result = {
        collectionUniverseId: collectionUniverseId.toString(),
        items: data.length > 0 ? data : [],
      };

      console.log("Related Items for collection:", result);

      setRelatedWishlistItems(result);
    } catch (error) {
      console.error("Error fetching wishlisted items:", error);
    }
  };

  useEffect(() => {
    // when there is collection, try fetch wishlist
    if (collectionUniverseId) {
      console.log(
        "Fetching wishlist items for collection:",
        collectionUniverseId
      );
      fetchWishlistItems(Number(collectionUniverseId));
    }
  }, [collectionUniverseId]);

  // useEffect(() => {
  //   console.log("Wishlist Related Items:", relatedWishlistItems);
  //   relatedWishlistItems.items.forEach((item) => {
  //     console.log("Item:", item);
  //   });
  // }, [relatedWishlistItems]);

  return (
    <>
      <Header />
      {/* <h2 className="px-20 pt-14 font-manrope font-bold text-4xl text-center">
        {collectionName} Wishlist Items
      </h2> */}

      <div className="w-full px-16">
        {/* const collection = collections.find((col) => col.id === collectionId); */}
        <div key={collectionUniverseId} className="my-8">
          <h1 className="font-semibold text-4xl w-fit text-black bg-yellow-300 rounded-full px-5 py-2">
            {collectionName} Wishlist Items
            {/* {collectionUniverseId} */}
          </h1>

          <h1 className="px-20 pt-14 font-manrope font-bold text-2xl text-center">
            Matched Items
          </h1>

          {myMatches.items.length > 0 ? (
            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
              {myMatches.items.map((item: any, index) => (
                <div key={`item.link-${index}`}>
                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                    <div className="h-64 w-full relative bg-gray-100 rounded-md pt-3 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="max-h-full max-w-full object-cover"
                      />
                    </div>

                    <div className="space-y-1 p-4 cursor-default">
                      <div className="group relative">
                        <p
                          key={item.title}
                          className="mt-4 text-lg font-bold pl-4 uppercase truncate"
                        >
                          {`${item.title}`}
                        </p>
                        <span
                          className="absolute bottom-full left-0 w-auto p-2 mb-2 text-md text-black bg-yellow-300 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          style={{
                            transform: "translateX(-10px)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {`${item.title}`}
                        </span>
                      </div>

                      <p
                        key={item.price}
                        className={
                          "text-md font-semibold pl-4 capitalize truncate"
                        }
                      >
                        {`${item.price}`}
                      </p>
                      <div className="flex justify-center mt-2">
                        <a
                          className="btn btn-primary mt-2 text-lg hover:btn-primary"
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          See Item
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-lg mt-6">
              No wishlist items for this collection.
            </p>
          )}

          <h1 className="px-20 pt-14 font-manrope font-bold text-2xl text-center">
            Related Items
          </h1>

          {relatedWishlistItems.items.length > 0 ? (
            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
              {myScrapedWishlistItems.items.map((item: any, index) => (
                <div key={`item.link-${index}`}>
                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                    <div className="h-64 w-full relative bg-green-100 rounded-md pt-3 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-auto w-auto max-h-none max-w-none object-cover scale-150"
                      />
                    </div>

                    <div className="space-y-1 p-4 cursor-default">
                      <div className="group relative">
                        <p
                          key={item.title}
                          className="mt-4 text-lg font-bold pl-4 uppercase truncate"
                        >
                          {`${item.title}`}
                        </p>
                        <span
                          className="absolute bottom-full left-0 w-auto p-2 mb-2 text-md text-black bg-yellow-300 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          style={{
                            transform: "translateX(-10px)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {`${item.title}`}
                        </span>
                      </div>

                      <p
                        key={item.price}
                        className={
                          "text-md font-semibold pl-4 capitalize truncate"
                        }
                      >
                        {`${item.price}`}
                      </p>
                      <div className="flex justify-center mt-2">
                        <a
                          className="btn btn-primary mt-2 text-lg hover:btn-primary"
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          See Item
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-lg mt-6">No related items</p>
          )}

          <h1 className="px-20 pt-14 font-manrope font-bold text-2xl text-center">
            All Scraped Items
          </h1>

          {myScrapedWishlistItems.items.length > 0 ? (
            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
              {myScrapedWishlistItems.items.map((item: any, index) => (
                <div key={`item.link-${index}`}>
                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                    <div className="h-64 w-full relative bg-gray-100 rounded-md pt-3 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-auto w-auto max-h-none max-w-none object-cover scale-150"
                      />
                    </div>

                    <div className="space-y-1 p-4 cursor-default">
                      <div className="group relative">
                        <p
                          key={item.title}
                          className="mt-4 text-lg font-bold pl-4 uppercase truncate"
                        >
                          {`${item.title}`}
                        </p>
                        <span
                          className="absolute bottom-full left-0 w-auto p-2 mb-2 text-md text-black bg-yellow-300 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          style={{
                            transform: "translateX(-10px)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {`${item.title}`}
                        </span>
                      </div>

                      <p
                        key={item.price}
                        className={
                          "text-md font-semibold pl-4 capitalize truncate"
                        }
                      >
                        {`${item.price}`}
                      </p>
                      <div className="flex justify-center mt-2">
                        <a
                          className="btn btn-primary mt-2 text-lg hover:btn-primary"
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          See Item
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-lg mt-6">
              No wishlist items for this collection.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default WishlistItems;
