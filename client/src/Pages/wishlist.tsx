import { useEffect, useState } from "react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Collection } from "../Types/Collection";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import fetchJWT from "../fetchJWT";

function Wishlist() {
  const [user, setUser] = useState<any>(null);
  const [JWT, setJWT] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isUserFetched, setIsUserFetched] = useState(false);
  const [isTokenFetched, setIsTokenFetched] = useState(false);
  const [isUserIdFetched, setIsUserIdFetched] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);

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
          "http://localhost:3000/user/?user_email=" + user.loginId,
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

  useEffect(() => {
    // fetch collections
    if (isUserIdFetched && userId) {
      // console.log("in fetch collections ", userId);
      const fetchCollections = async () => {
        const response = await fetch(
          "http://localhost:3000/collection/user/" + userId,
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
        // console.log("collections as data: ", data);
        // console.log("1st collection:", data[0].collection_pic);

        setCollections(
          data.map((col: any) => {
            return {
              name: col.name,
              id: col.collection_id,
              collectionUniverseId: col.collection_universe_id,
              image_url: col.collection_pic,
              description: "",
              newListing: false,
              customAttributes: col.custom_attributes,
              favoriteAttributes: col.favorite_attributes,
              hiddenAttributes: col.hidden_attributes,
            };
          })
        );

        //console.log("Collections as collection:", collections);
      };

      fetchCollections();
    }
  }, [isUserIdFetched, userId, JWT]);

  // ------------------ fetch wishlist items ----------------------
  useEffect(() => {
    // collection id that get passed in wishlist
    const collectionIds = JSON.parse(
      localStorage.getItem("collectionIds") || "[]"
    );
    console.log("Collection IDs:", collectionIds);
  }, []);

  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  const fetchWishlistItems = async (collectionIds: number[]) => {
    try {
      // fetch items for each collections
      const promises = collectionIds.map(async (id) => {
        const response = await fetch(
          `http://localhost:3000/wishlist/wishlisted-collectables/${id}`
        );

        // if no wishlist items, return empty array
        if (!response.ok) {
          return { collectionId: id, items: [] };
        }

        const data = await response.json();
        return { collectionId: id, items: data.length > 0 ? data : [] };
      });

      const results = await Promise.all(promises);
      setWishlistItems(results);
    } catch (error) {
      console.error("Error fetching wishlisted items:", error);
    }
  };

  useEffect(() => {
    const collectionIds = JSON.parse(
      localStorage.getItem("collectionIds") || "[]"
    );

    // when there is collection, try fetch wishlist
    if (collectionIds.length > 0) {
      fetchWishlistItems(collectionIds);
    }
  }, []);

  useEffect(() => {
    console.log("Wishlist Items:", wishlistItems);
  }, [wishlistItems]);

  return (
    <>
      <Header />
      <h2 className="px-20 pt-14 font-manrope font-bold text-4xl text-center">
        New Items For You:
      </h2>

      <div className="w-full px-16">
        {wishlistItems.map(({ collectionId, items }) => {
          const collection = collections.find((col) => col.id === collectionId);

          return (
            <div key={collectionId} className="my-8">
              <h3 className="font-semibold text-2xl w-fit text-black bg-yellow-300 rounded-full px-5 py-2">
                {collection?.name}
              </h3>

              {items.length > 0 ? (
                <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
                  {items.map((item: any) => (
                    <div key={item.universeCollectableId}>
                      <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                        <div className="h-22 w-30">
                          <img
                            src={
                              item.attributes.find(
                                (attr: any) => attr.name === "image"
                              )?.value || "/placeholder.jpg"
                            }
                            alt={
                              item.attributes.find(
                                (attr: any) => attr.name === "name"
                              )?.value || "No Name"
                            }
                            width={400}
                            height={400}
                            className="rounded-md shadow-sm object-cover pt-3"
                          />
                        </div>

                        <div className="space-y-1 p-4">
                          {item.attributes
                            .filter(
                              (attribute: any) =>
                                attribute.name !== "image" &&
                                attribute.name !== "owned"
                            )
                            .slice(0, 3)
                            .map((attribute: any, index: number) => (
                              <p
                                key={attribute.slug || attribute.name}
                                className={
                                  index === 0
                                    ? "mt-4 text-lg font-bold pl-4 uppercase truncate"
                                    : "text-md font-semibold pl-4 capitalize truncate"
                                }
                              >
                                {`${attribute.value}`}
                              </p>
                            ))}
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
          );
        })}
      </div>
      <Footer />
    </>
  );
}

export default Wishlist;
