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

  const { collectionId } = useParams<{ collectionId: string }>();

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
    setCollectionName(storedName ? storedName : "");
  }, []);

  interface WishlistItem {
    title: string;
    price: string;
    link: string;
    image_url: string;
  }

  interface WishlistItemsState {
    collectionId: string;
    items: WishlistItem[];
  }

  const [myWishlistItems, setMyWishlistItems] = useState<WishlistItemsState>({
    collectionId: "",
    items: [],
  });
  const [relatedWishlistItems, setRelatedWishlistItems] =
    useState<WishlistItemsState>({ collectionId: "", items: [] });

  const fetchWishlistItems = async (collectionId: number) => {
    // fetch items user listed
    try {
      // fetch items for collection
      const response = await fetch(
        // `http://localhost:3000/wishlist/whooga-alert/my-wishlisted/${collectionId}`
        // `http://localhost:3000/wishlist/whooga-alert/my-wishlisted/113`
        buildPath(`wishlist/whooga-alert/my-wishlisted/${collectionId}`)
      );

      // if no wishlist items, return empty array
      if (!response.ok) {
        const result = { collectionId: collectionId.toString(), items: [] };
        setMyWishlistItems(result);
      }

      const data = await response.json();
      const result = {
        collectionId: collectionId.toString(),
        items: data.length > 0 ? data : [],
      };

      setMyWishlistItems(result);
    } catch (error) {
      console.error("Error fetching wishlisted items:", error);
    }

    // fetch related items
    try {
      // fetch items for collection
      const response = await fetch(
        // `http://localhost:3000/wishlist/whooga-alert/related-wishlisted/${collectionId}`
        //`http://localhost:3000/wishlist/whooga-alert/related-wishlisted/113`
        buildPath(`wishlist/whooga-alert/related-wishlisted/${collectionId}`)
      );

      // if no wishlist items, return empty array
      if (!response.ok) {
        const result = { collectionId: collectionId.toString(), items: [] };
        setRelatedWishlistItems(result);
      }

      const data = await response.json();
      const result = {
        collectionId: collectionId.toString(),
        items: data.length > 0 ? data : [],
      };

      setRelatedWishlistItems(result);
    } catch (error) {
      console.error("Error fetching wishlisted items:", error);
    }
  };

  useEffect(() => {
    // when there is collection, try fetch wishlist
    if (collectionId) {
      fetchWishlistItems(Number(collectionId));
    }
  }, [collectionId]);

  // useEffect(() => {
  //   console.log("Wishlist Related Items:", relatedWishlistItems);
  //   relatedWishlistItems.items.forEach((item) => {
  //     console.log("Item:", item);
  //   });
  // }, [relatedWishlistItems]);

  return (
    <>
      <Header />
      <h2 className="px-20 pt-14 font-manrope font-bold text-4xl text-center">
        New Items For You:
      </h2>

      <div className="w-full px-16">
        {/* const collection = collections.find((col) => col.id === collectionId); */}
        <div key={collectionId} className="my-8">
          <h3 className="font-semibold text-2xl w-fit text-black bg-yellow-300 rounded-full px-5 py-2">
            {collectionName}
          </h3>

          {myWishlistItems.items.length > 0 ? (
            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
              {myWishlistItems.items.slice(0, 50).map((item: any) => (
                <div key={item.link}>
                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                    <div className="h-22 w-30">
                      <img
                        src={item.image_url || "/placeholder.jpg"}
                        alt={item.title || "No Name"}
                        width={400}
                        height={400}
                        className="rounded-md shadow-sm object-cover pt-3"
                      />
                    </div>

                    <div className="space-y-1 p-4">
                      <p
                        key={item.title}
                        className={
                          "mt-4 text-lg font-bold pl-4 uppercase truncate"
                        }
                      >
                        {`${item.title}`}
                      </p>

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
