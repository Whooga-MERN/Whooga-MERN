import { IoMdAddCircleOutline } from "react-icons/io";
import { IconContext } from "react-icons";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import debounce from "lodash.debounce";
import { Collection } from "../Types/Collection";
import { useEffect, useState } from "react";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import fetchJWT from "../fetchJWT";
import { fetchCollectionSearchResults } from "../utils/collectionsPage";

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

        //console.log("Collections as collection:", collections);
      };

      fetchCollections();
    }
  }, [isUserIdFetched, userId, JWT]);

  function handleClick(collectionId: number) {
    const collection = collections.find((col) => col.id === collectionId);
    console.log("collection upon being clicked: ", collection);
    if (collection) {
      localStorage.setItem(
        "customAttributes",
        JSON.stringify(collection.customAttributes)
      );
      localStorage.setItem(
        "favoriteAttributes",
        JSON.stringify(collection.favoriteAttributes)
      );
      localStorage.setItem(
        "hiddenAttributes",
        JSON.stringify(collection.hiddenAttributes)
      );
      console.log("sending UCID: ", collection.collectionUniverseId);
      localStorage.setItem("collectionUniverseId", collection.collectionUniverseId);
      localStorage.setItem("collectionName", collection.name);
      navigate(`/items/${collectionId}`);
      console.log("clicked collection");
    } else {
      console.error("Collection not found");
    }
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
  } = useQuery(
    ["search", debouncedSearchTerm],
    () => fetchCollectionSearchResults(debouncedSearchTerm, userId),
    {
      enabled: debouncedSearchTerm.length > 0,
    }
  );

  return (
    <>
      <Header />
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="px-20 font-manrope font-bold text-4xl text-center">
            My Collections
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
      <div className="w-full px-32">
        <div className="mt-8 grid lg:grid-cols-5 gap-10 md:grid-cols-4 sm:grid-cols-2">
          {debouncedSearchTerm.length > 0 ? (
            searchResults && searchResults.length > 0 ? (
              searchResults.map((result: any) => {
                const { collections, collectionUniverses } = result;

                return (
                  <div key={collections.collection_id}>
                    <div
                      className="card card-compact card-bordered bg-base-200 hover:shadow-2xl cursor-pointer dark:bg-base-300"
                      onClick={() => handleClick(collections.collection_id)}
                    >
                      <div
                        style={{
                          right: "3%",
                          bottom: "97%",
                          position: "absolute",
                        }}
                      >
                        {collections.newListing ? (
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
                          src={collections.collection_pic}
                          alt={collections.collection_id}
                        />
                      </figure>
                      <div className="card-body">
                        <h2 className="card-title">
                          {collectionUniverses.name}
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
                  onClick={() => handleClick(collection.id)}
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
                    <h2 className="card-title">{collection.name}</h2>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">No collections found</div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
