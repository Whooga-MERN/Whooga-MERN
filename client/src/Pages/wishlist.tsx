import { IoMdAddCircleOutline } from "react-icons/io";
import { IconContext } from "react-icons";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { Collection } from "../Types/Collection";
import { useEffect, useState } from "react";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import fetchJWT from "../fetchJWT";
import { fetchCollectionSearchResults } from "../utils/collectionsPage";
import { buildPath } from "../utils/utils";

export default function Collections() {
  const [user, setUser] = useState<any>(null);
  const [JWT, setJWT] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [collections, setCollections] = useState<any[]>([]);
  const [customAttributes, setCustomAttributes] = useState<string>("");
  const [favoriteAttributes, setFavoriteAttributes] = useState<string>("");
  const [hiddenAttributes, setHiddenAttributes] = useState<string>("");
  const [isUserFetched, setIsUserFetched] = useState(false);
  const [isTokenFetched, setIsTokenFetched] = useState(false);
  const [isUserIdFetched, setIsUserIdFetched] = useState(false);
  const navigate = useNavigate();

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
        console.log("setting user id: ", data[0].user_id);
        setUserId(data[0].user_id);
        setIsUserIdFetched(true);
      };
      getUserId();
    }
  }, [isUserFetched, isTokenFetched, user, JWT]);

  useEffect(() => {
    // fetch collections
    if (isUserIdFetched && userId) {
      console.log("in fetch collections ", userId);
      const fetchCollections = async () => {
        const response = await fetch(
          // "http://localhost:3000/collection/user/" + userId,
          buildPath(`collection/user/${userId}`),
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
        console.log("collections as data: ", data);
        console.log("1st collection:", data[0].collection_pic);

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


        const collectionIds = data.map(
          (col: { collection_id: string, collection_universe_id: string }) => [col.collection_id, col.collection_universe_id]
        );
        localStorage.setItem("collectionIds", JSON.stringify(collectionIds));

        console.log("Collections as collection:", collections);
      };

      fetchCollections();
    }
  }, [isUserIdFetched, userId, JWT]);

  function handleClick(collectionUniverseId: number) {
    console.log("collectionUniverseId: ", collectionUniverseId);
    console.log("collections: ", collections);
    const collection = collections.find((col) => col.collectionUniverseId === collectionUniverseId);
    console.log("collectionUId: ", collectionUniverseId);
    console.log("collection upon being clicked: ", collection);
    console.log("sending UCID: ", collection.collectionUniverseId);
    localStorage.setItem(
      "collectionUniverseId",
      collection.collectionUniverseId
    );
    localStorage.setItem("collectionName", collection.name);
    console.log("collection upon being clicked: ", collection);
    navigate(`/wishlist/${collectionUniverseId}`);
    console.log("clicked collection");
  }

  // ------------------------- search --------------------------
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState<string>(searchTerm);

  useEffect(() => {
    const debounced = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    debounced();

    return () => {
      debounced.cancel();
    };
  }, [searchTerm]);

  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
    isError: searchIsError,
    error: searchError,
  } = useQuery({
    queryKey: ["search", debouncedSearchTerm],
    queryFn: async () =>
      await fetchCollectionSearchResults(debouncedSearchTerm, userId),
    enabled: debouncedSearchTerm.length > 0,
  });

  return (
    <>
      <Header />
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="px-20 font-manrope font-bold text-4xl text-center flex justify-center items-center">
            My Wishlist
            {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EDC307" className="size-8 ml-2">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg> */}

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EDC307" className="size-8  ml-2">
              <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z" clipRule="evenodd" />
            </svg>


          </h2>
          <div className="flex flex-col md:flex-row md:items-center justify-right py-9">
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="search"
                className="grow w-60"
                placeholder='Search "My Collections"'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            {/* New Button */}
            <div className="pl-20 relative sm: w-[400px] border-none ml-auto">
              <IconContext.Provider value={{ color: "#554141", size: "35px" }}>
                <Link
                  to="/new_collection_start"
                  className="btn btn-primary text-2xl w-250 "
                >
                  New Collection
                  <IoMdAddCircleOutline />
                </Link>
              </IconContext.Provider>
            </div>
          </div>
        </div>
      </div>

      {/* collections */}
      <div className="w-full px-32 ">
        <div className="mt-8 grid lg:grid-cols-5 gap-10 md:grid-cols-4 sm:grid-cols-2">
          {debouncedSearchTerm.length > 0 ? (
            searchResults && searchResults.length > 0 ? (
              searchResults.map((result: any) => {
                const { collections: collection, collectionUniverses: collectionUniverse } = result;

                return (
                  <div key={collection.collection_id}>
                    <div
                      className="card card-compact card-bordered bg-base-200 hover:shadow-2xl cursor-pointer dark:bg-base-300"
                      onClick={() => handleClick(collection.collection_universe_id)}
                    >
                      <div
                        style={{
                          right: "3%",
                          bottom: "97%",
                          position: "absolute",
                        }}
                      >
                        {collection.newListing ? (
                          <div className="badge h-8 text-lg font-bold badge-primary">
                            WHOOGA!
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                      <figure style={{ aspectRatio: "1 / 1" }}>
                        <img
                          className="object-cover w-full h-full rounded-t-lg border-b-2"
                          style={{
                            height: "95%",
                            width: "95%",
                            aspectRatio: "1 / 1",
                          }}
                          src={collectionUniverse.universe_collection_pic}
                          // src={"/placeholder.jpg"}
                          alt={collectionUniverse.name}
                        />
                      </figure>
                      <div className="card-body">
                        <h2 className="card-title">
                          {collectionUniverse.name + " Wishlist"}
                        </h2>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center">No collections found</div>
            )
          ) : collections.length > 0 ? (
            collections.map((collection: any) => (
              <div key={collection.id}>
                <div
                  className="card card-compact card-bordered bg-base-200 hover:shadow-2xl cursor-pointer dark:bg-base-300"
                  onClick={() => handleClick(collection.collectionUniverseId)}
                >
                  <div
                    style={{
                      right: "3%",
                      bottom: "97%",
                      position: "absolute",
                    }}
                  >
                    {collection.newListing ? (
                      <div className="badge h-8 text-lg font-bold badge-primary">
                        WHOOGA!
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <figure style={{ aspectRatio: "1 / 1" }}>
                    <img
                      className="object-cover w-full h-full rounded-t-lg border-b-2"
                      style={{
                        height: "95%",
                        width: "95%",
                        aspectRatio: "1 / 1",
                      }}
                      src={collection.image_url}
                      alt={collection.name}
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">
                      {collection.name + " Wishlist"}
                    </h2>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">No collections found</div>
          )}
        </div>
      </div>

      <footer className="w-full absolute bottom-0 z-50 dark:text-white bg-white dark:bg-transparent">
        <div className="container p-5 mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">WHOOGA!</span>
            <div className="flex space-x-4 text-xl font-bold">
              <Link to="/privacypolicy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link to="/contactus" className="hover:underline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright section */}
        <hr className="border-gray-700" />
        <div className="p-3 text-center">
          © 2024 WHOOGA! All rights reserved.
        </div>
      </footer>
    </>
  );
}
