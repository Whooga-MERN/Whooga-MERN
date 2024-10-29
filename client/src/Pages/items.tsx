import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import _ from "lodash";

import {
  FaListUl,
  FaRegEdit,
  FaSortAmountDown,
  FaFilter,
} from "react-icons/fa";
import { BsFillGridFill } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoIosAdd } from "react-icons/io";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegularStar } from "@fortawesome/free-regular-svg-icons";

import Header from "../Components/Header";
import Modal from "../Components/Modal";
import Footer from "../Components/Footer";
import SearchBar from "../Components/searchBar";
import OwnedToggle from "../Components/ownedToggle";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersection } from "@mantine/hooks";

import { buildPath } from "../utils/utils";
import {
  fetchUniverseCollectables,
  fetchUniverseSearchResults,
  fetchOwnedCollectables,
  fetchOwnedSearchResults,
  addToWishlist,
  removeFromWishlist,
} from "../utils/ItemsPage";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import fetchJWT from "../fetchJWT";

const ITEMS_PER_PAGE = 12;
const initialPage = 1;

const sortBy = [
  { id: "yearLowToHigh", label: "Year: Low to High" },
  { id: "yearHighToLow", label: "Year: High to Low" },
  { id: "tagLowToHigh", label: "Tag ID: Low to High" },
  { id: "tagHighToLow", label: "Tag ID: High to Low" },
];
const color = [
  "purple",
  "red",
  "yellow",
  "pink",
  "brown",
  "blue",
  "orange",
  "white",
  "grey",
  "black",
  "green",
];

export default function HomePage() {
  // add collectible form modal open handler
  const openModal = () => {
    setIsModalOpen(true);
    console.log("attributes", favoriteAttributes.concat(customAttributes));
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // edit collectible
  const openEdit = (item: Record<string, any>) => {
    setSpecificTag(item);
    setShowEdit(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setSpecificTag(null);
  };

  const handleDelete = async (item: Record<string, any>) => {
    console.log("Delete button clicked");
    console.log("Item to delete:", item.universeCollectableId);

    const request = {
      universeCollectableId: item.universeCollectableId,
    }

    try {
      const response = await fetch(buildPath(`universe-collectable/delete-universe-collectable`), {
        method: "DELETE",
        body: JSON.stringify(request),
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      });

      if (response.ok) {
        console.log("Item deleted successfully");
      } else {
        console.error("Error deleting item:", response);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }

  };

  const [isOwned, setIsOwned] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // new collectible
  const [showEdit, setShowEdit] = useState(false); // edit collectible
  const [selectedSort, setSelectedSort] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "grid">("grid");

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSort(e.target.value);
  };

  // handle color checkbox changes
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColors(
      (prevSelectedColors) =>
        prevSelectedColors.includes(color)
          ? prevSelectedColors.filter((c) => c !== color) // remove if already selected
          : [...prevSelectedColors, color] // add if not selected
    );
  };

  // handle filter and sort
  // const processedTags = [...tags]
  //   .filter((tag) => {
  //     if (selectedColors.length > 0) {
  //       // check array
  //       return tag.color.some((color) =>
  //         selectedColors.includes(color.toLowerCase())
  //       );
  //     }
  //     return true;
  //   })
  //   .sort((a, b) => {
  //     const dateA = new Date(a.createAt);
  //     const dateB = new Date(b.createAt);
  //     const tagNumA = parseInt(a.tagNum.replace("#", ""));
  //     const tagNumB = parseInt(b.tagNum.replace("#", ""));

  //     switch (selectedSort) {
  //       case "yearLowToHigh":
  //         return dateA.getTime() - dateB.getTime();
  //       case "yearHighToLow":
  //         return dateB.getTime() - dateA.getTime();
  //       case "tagLowToHigh":
  //         return tagNumA - tagNumB;
  //       case "tagHighToLow":
  //         return tagNumB - tagNumA;
  //       default:
  //         return 0;
  //     }
  //   });

  // -------------- handle star click-------------------
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlistIds");
    if (savedWishlist) {
      setWishlistIds(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlistIds", JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const handleStarClick = (
    universeCollectableId: number,
    collectionId?: string
  ) => {
    if (!collectionId) return;
    // check if in wishlist
    if (wishlistIds.includes(universeCollectableId)) {
      // Remove the item from the wishlist and change the star to regular
      setWishlistIds((prev) =>
        prev.filter((id) => id !== universeCollectableId)
      );
      removeFromWishlist(collectionId, universeCollectableId);
    } else {
      // Add the item to the wishlist and make the star solid
      setWishlistIds((prev) => [...prev, universeCollectableId]);
      addToWishlist(collectionId, universeCollectableId);
    }
  };

  //--------------------- handle form field ------------------------
  const [formData, setFormData] = useState<Record<string, any>>({ owned: "F" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isNewCollectableWishlist, setIsNewCollectableWishlist] =
    useState<boolean>(false);
  const [isPublished, setIsPublished] = useState(false);

  // handle form field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleOwnedChange = (owned: boolean) => {
    setFormData((prevData) => ({ ...prevData, ["owned"]: owned ? "T" : "F" }));
  }

  // handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

    const handlePublishChange = () => {
    setIsPublished(!isPublished);
  };

  // handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const request = new FormData();

    if (collectionId) {
      request.append("collection_id", collectionId);
    } else {
      console.error("Collection ID is undefined");
      return;
    }
    request.append("attributes_values_json", JSON.stringify(formData));
    request.append("isPublished", isPublished ? "true" : "false");
    if (imageFile) {
      request.append("collectableImage", imageFile);
    }

    logFormData(request);

    try {
      const response = await fetch(buildPath(`collectable/newCollectable`), {
        method: "POST",
        body: request,
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      });

      if (response.ok) {
        console.log("Form submitted successfully");
      } else {
        console.error("Error submitting form:", response);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }

    closeModal();
    window.location.reload();
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const request = new FormData();

    if (collectionId) {
      request.append("collectionId", collectionId);
    } else {
      console.error("Collection ID is undefined");
      return;
    }
    if (specificTag?.universeCollectableId) {
      request.append(
        "universeCollectableId",
        specificTag.universeCollectableId
      );
    }
    console.log("universe collectable id: ", specificTag?.universeCollectableId);
    const { owned, image, ...restFormData } = formData;
    console.log("owned", owned);
    request.append("attributeValuesJson", JSON.stringify(restFormData));
    if (owned !== undefined) {
      request.append("owned", owned);
    }
    if (imageFile) {
      request.append("collectableImage", imageFile);
    }
    else{
      request.append("collectableImage", image);
    }

    logFormData(request);

    try {
      const response = await fetch(buildPath(`collectable/edit-collectable`), {
        method: "PUT",
        body: request,
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      });

      if (response.ok) {
        console.log("Form submitted successfully");
      } else {
        console.error("Error submitting form:", response);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }

    closeEdit();
    //window.location.reload();
  };

  const logFormData = (formData: FormData) => {
    const formDataEntries: Record<string, any> = {};
    formData.forEach((value, key) => {
      formDataEntries[key] = value;
    });
    console.log("FormData Contents:", formDataEntries);
  };

  // --------------------- get user information -----------------
  const [userId, setUserId] = useState<any>(null);
  const [JWT, setJWT] = useState<string>("");
  const { collectionId } = useParams<{ collectionId: string }>();
  const [customAttributes, setCustomAttributes] = useState<string[]>([]);
  const [favoriteAttributes, setFavoriteAttributes] = useState<string[]>([]);
  const [hiddenAttributes, setHiddenAttributes] = useState<string[]>([]);

  useEffect(() => {
    // user.loginId to get email, get attributes, and get JWT
    const fetchUserDetails = async () => {
      try {
        const user = await fetchUserLoginDetails();
        setUserId(user || "");
      } catch (error) {
        console.error("Error Fetching User");
      }
    };
    fetchUserDetails();

    const fetchToken = async () => {
      try {
        const token = await fetchJWT();
        setJWT(token || "");
      } catch (error) {
        console.error("Error fetching JWT");
      }
    };
    fetchToken();

    const getAttributes = async () => {
      const storedCustomeAttributes = localStorage.getItem("customAttributes");
      const storedFavoriteAttributes =
        localStorage.getItem("favoriteAttributes");
      const storedHiddenAttributes = localStorage.getItem("hiddenAttributes");
      if (storedCustomeAttributes) {
        setCustomAttributes(JSON.parse(storedCustomeAttributes));
      }
      if (storedFavoriteAttributes) {
        setFavoriteAttributes(JSON.parse(storedFavoriteAttributes));
      }
      if (storedHiddenAttributes) {
        setHiddenAttributes(JSON.parse(storedHiddenAttributes));
      }
    };
    getAttributes();
  }, []);

  if (!collectionId) {
    return <div>Error: Collection ID is missing!</div>;
  }

  // -------------------------- show universecollectables and search ------------------
  const [universeCollectionId, setUniverseCollectionId] = useState<
    string | null
  >(null);
  const [universeCollectionName, setUniverseCollectionName] = useState("");
  const [universeCollectables, setUniverseCollectables] = useState<any[]>([]);
  const [ownedCollectables, setOwnedCollectables] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [resetDropdown, setResetDropdown] = useState(false);
  const [noSearchResults, setNoSearchResults] = useState(false);

  useEffect(() => {
    var collectionUID = localStorage.getItem("collectionUniverseId") ?? "";
    setUniverseCollectionId(collectionUID);
    const collectionName = localStorage.getItem("collectionName") ?? "";
    setUniverseCollectionName(collectionName);
  }, []);

  useEffect(() => {
    const getUniverseCollectionId = async () => {
      try {
        if (collectionId) {
          const ownedCollectables = await fetchOwnedCollectables(
            collectionId,
            initialPage,
            ITEMS_PER_PAGE
          );
          setOwnedCollectables(ownedCollectables);

          if (universeCollectionId) {
            const collectables = await fetchUniverseCollectables(
              universeCollectionId,
              initialPage,
              ITEMS_PER_PAGE
            );
            setUniverseCollectables(collectables);
          }
        } else {
          console.error("universeCollectionId is null");
        }
      } catch (e) {
        setError("Error fetching universe collection ID");
        console.error(e);
      }
    };

    getUniverseCollectionId();
  }, [collectionId, universeCollectionId]);

  const handleSearchResults = (results: any[]) => {
    console.log("Search Results:", results);
    if (results.length === 0) {
      setNoSearchResults(true);
    } else {
      setNoSearchResults(false);
      setSearchResults(results);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setResetDropdown(true);
    setNoSearchResults(false);
  };

  const { ref: collectableRef, entry: collectableEntry } = useIntersection({
    threshold: 1,
  });
  const { ref: searchRef, entry: searchEntry } = useIntersection({
    threshold: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const handleToggleChange = (enabled: boolean) => {
    setEnabled(enabled);
    handleClearSearch();
    setCurrentPage(1);
  };

  const {
    data: collectablesDate,
    fetchNextPage: fetchCollectablesNextPage,
    hasNextPage: hasMoreCollectables,
    isFetchingNextPage: isFetchingCollectables,
  } = useInfiniteQuery({
    queryKey: ["collectables", collectionId, universeCollectionId, enabled],
    queryFn: ({ pageParam = 1 }) => {
      if (enabled) {
        return fetchOwnedCollectables(collectionId!, pageParam, ITEMS_PER_PAGE);
      } else {
        return fetchUniverseCollectables(
          universeCollectionId!,
          pageParam,
          ITEMS_PER_PAGE
        );
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (collectableEntry?.isIntersecting && hasMoreCollectables) {
      fetchCollectablesNextPage().then((result) => {
        const newPages = result.data;

        if (newPages) {
          setCurrentPage((prevPage) => {
            const nextPage = prevPage + 1;
            return nextPage;
          });
        }
      });
    }
  }, [collectableEntry, hasMoreCollectables, fetchCollectablesNextPage]);

  const collectables = collectablesDate?.pages.flatMap((page) => page) ?? [];

  // Error handler for search queries
  const handleError = (error: any) => {
    console.error("Search error:", error);
    alert("An error occurred during the search. Please try again.");
  };

  // ------------------------ open card for details -----------------------------------
  const [showModal, setShowModal] = useState(false);
  const [specificTag, setSpecificTag] = useState<Record<string, any> | null>(
    null
  );

  const handleOpenModal = (item: Record<string, any>) => {
    setSpecificTag(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSpecificTag(null);
  };

  useEffect(() => {
    // Initialize formData with specificTag attributes
    if (specificTag) {
      const initialFormData = specificTag.attributes.reduce(
        (
          acc: { [x: string]: any },
          attr: { name: string | number; value: any }
        ) => {
          acc[attr.name] = attr.value;
          return acc;
        },
        {} as Record<string, string>
      );
      setFormData(initialFormData);
    }
  }, [specificTag]);

  const [searchTags, setSearchTags] = useState<
    { attribute: string; term: string }[]
  >([]);

  const {
    data: searchResultsData,
    fetchNextPage: fetchSearchNextPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingSearchResults,
  } = useInfiniteQuery({
    queryKey: ["searchResults", searchTags, enabled],
    queryFn: ({ pageParam = 1 }) => {
      if (enabled) {
        return fetchOwnedSearchResults(
          searchTags,
          userId,
          collectionId,
          pageParam
        );
      } else {
        return fetchUniverseSearchResults(
          searchTags,
          userId,
          universeCollectionId!,
          pageParam
        );
      }
    },
    initialPageParam: 1,
    enabled: searchTags.length > 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === ITEMS_PER_PAGE ? allPages.length + 1 : undefined,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (searchEntry?.isIntersecting && hasNextSearchPage) {
      fetchSearchNextPage().then((result) => {
        const newPages = result.data;

        if (newPages) {
          setCurrentPage((prevPage) => {
            const nextPage = prevPage + 1;
            return nextPage;
          });
        }
      });
    }
  }, [searchEntry, hasNextSearchPage, fetchSearchNextPage]);

  const _searchResults = searchResultsData?.pages.flat() || [];

  const handleSearch = async (
    searchTags: { attribute: string; term: string }[]
  ) => {
    console.log("Search Tags Received:", searchTags);
    setSearchTags(searchTags); // Update search tags
    // Reset the results and current page
    setSearchResults([]);
    // Refetch with new search tags
    fetchSearchNextPage();
  };

  return (
    <>
      <div>
        <Header />
        <div className="w-full mx-auto pt-16">
          <div className="mx-auto pl-10">
            {/* collection option */}
            <div className="flex items-center gap-4">
              <p className="font-bold text-xl w-fit text-black bg-yellow-300 rounded-full px-8 py-3">
                {universeCollectionName}
              </p>
              <OwnedToggle
                enabled={enabled}
                setEnabled={setEnabled}
                onToggle={handleToggleChange}
              />
            </div>

            <div className="flex md:items-center justify-center gap-8 py-9 max-md:px-4">
              {/* Search bar */}
              {universeCollectionId && (
                <SearchBar
                  attributes={favoriteAttributes}
                  onSearchResults={handleSearchResults}
                  onResetSearch={() => setSearchResults([])}
                  resetDropdown={resetDropdown}
                  setResetDropdown={setResetDropdown}
                  onSearch={handleSearch}
                />
              )}

              {/* icon button for view*/}
              <div className="hidden lg:block md:block pt-3 mt-3">
                <button
                  className="inline-block pr-5"
                  onClick={() => setView("list")}
                >
                  <FaListUl />
                </button>
                <button
                  className="inline-block pr-16"
                  onClick={() => setView("grid")}
                >
                  <BsFillGridFill />
                </button>
                {isOwned ? (
                  <div>
                    <button
                      className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full w-fit"
                      onClick={openModal}
                    >
                      New Collectible
                      <IoIosAdd />
                    </button>
                    <button
                      className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full w-fit"
                      onClick={openModal}
                    >
                      Bulk Upload
                      <IoIosAdd />
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full w-fit"
                    onClick={() => {
                      // create onClick to call API to add to the user's collections
                      console.log("Add to My Collections clicked");
                    }}
                  >
                    Add to My Collections
                    <IoIosAdd />
                  </button>
                )}

                {isModalOpen && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:w-3/4 lg:w-[480px] max-h-screen overflow-y-auto mt-20">
                      <h2 className="text-xl font-bold mb-4 dark:text-gray-300">
                        Create New Collectible
                      </h2>

                      <form onSubmit={handleSubmit}>
                        {favoriteAttributes
                          .concat(customAttributes)
                          .concat("owned", "image")
                          .filter((attr) => attr !== null)
                          .map((attribute, index) => (
                            <div key={index} className="mb-4 lg:max-w-lg">
                              {attribute !== "image" ? (
                                attribute === "owned" ? (
                                  <div className="flex items-center mb-3">
                                    <input
                                      type="checkbox"
                                      id="publishCollection"
                                      onChange={(e) => handleOwnedChange(e.target.checked)}
                                      className="h-5 w-5 text-primary border-gray-300 rounded mr-2"
                                    />
                                    <label
                                      htmlFor="publishCollection"
                                      className="text-gray-700 dark:text-gray-300 text-sm font-bold"
                                    >
                                      Is Owned
                                    </label>
                                  </div>
                                ) : (
                                  <>
                                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                                      {attribute.charAt(0).toUpperCase() + attribute.slice(1)}
                                    </label>
                                    <input
                                      type="text"
                                      name={attribute}
                                      placeholder={`${attribute}`}
                                      value={formData[attribute] || ""}
                                      onChange={handleChange}
                                      className="border rounded w-full py-2 px-3 text-gray-700"
                                    />
                                  </>
                                )
                              ) : (
                                <>
                                  <label
                                    htmlFor="cover-photo"
                                    className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                                  >
                                    Upload Photo
                                  </label>
                                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 dark:bg-slate-300 px-6 py-10">
                                    <div className="text-center">
                                      <PhotoIcon
                                        aria-hidden="true"
                                        className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-400"
                                      />
                                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                        <label
                                          htmlFor="file-upload"
                                          className="relative cursor-pointer rounded-md px-2 bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                        >
                                          <span>Upload a photo</span>
                                          <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            onChange={handleFileChange}
                                          />
                                        </label>
                                        <p>or drag and drop</p>
                                      </div>
                                      <p className="text-xs leading-5 text-gray-600">PNG, JPG</p>
                                    </div>
                                  </div>
                                </>
                              )}
                              
                            </div>
                          ))}
                          <div className="flex items-center mb-3">
                            <input
                              type="checkbox"
                              id="publishCollection"
                              checked={isPublished}
                              onChange={handlePublishChange}
                              className="h-5 w-5 text-primary border-gray-300 rounded mb-2 mr-2"
                            />
                            <label
                              htmlFor="publishCollection"
                              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            >
                              Publish Collectable
                            </label>
                          </div>

                        <div className="flex justify-end space-x-4 mt-8">
                          <button
                            type="button"
                            onClick={closeModal}
                            className="bg-gray-300 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-xl"
                          >
                            Create
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* <div className="dropdown">
                  <div
                    tabIndex={0}
                    role="button"
                    className="ml-4 text-black bg-yellow-300 hover:bg-yellow-400 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-full text-lg px-4 py-2.5 text-center inline-flex items-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  >
                    <FaSortAmountDown />
                  </div>

                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-white dark:bg-gray-600 z-[1] w-60 pt-2 shadow"
                  >
                    <div className="space-y-4">
                      {sortBy.map((option) => (
                        <div key={option.id}>
                          <label>
                            <input
                              type="radio"
                              value={option.id}
                              checked={selectedSort === option.id}
                              onChange={handleRadioChange}
                              className="mr-2"
                            />
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ul>
                </div> */}

                {/* <div className="dropdown">
                  <div
                    tabIndex={0}
                    role="button"
                    className="ml-4 text-black bg-yellow-300 hover:bg-yellow-400 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-full text-lg px-4 py-2.5 text-center inline-flex items-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  >
                    <FaFilter />
                  </div>

                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-white dark:bg-gray-600 z-[1] w-60 pt-2 shadow"
                  >
                    Color Filter
                    <div className="space-y-4">
                      <span>Select Colors:</span>
                      <div className="flex flex-wrap gap-4">
                        {color.map((color) => (
                          <label key={color} className="flex items-center">
                            <input
                              type="checkbox"
                              value={color}
                              checked={selectedColors.includes(color)}
                              onChange={handleColorChange}
                              className="mr-2"
                            />
                            {color}
                          </label>
                        ))}
                      </div>
                    </div>
                  </ul>
                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col md:flex-row">
          {/* collectibles */}
          <div className="w-full p-2">
            <div className="text-xl py-4 text-right pr-10">
              Total items in the collection:{" "}
              {_searchResults.length > 0
                ? _searchResults.length
                : enabled
                ? ownedCollectables.length
                : universeCollectables.length}
            </div>

            {noSearchResults ? (
              <div className="pt-28 text-center w-full text-2xl font-extrabold text-gray-600">
                No match found :(
              </div>
            ) : (
              <div className="w-full p-2">
                {/* switch between grid and list */}
                {view === "list" ? (
                  <div className="flex flex-wrap -mx-4">
                    {(_searchResults.length > 0
                      ? _searchResults
                      : collectables
                    ).map((item) => (
                      <div
                        key={item.universeCollectableId}
                        className="w-full md:w-1/2 px-4 mb-6"
                      >
                        <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl">
                          <button
                            className="text-3xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                            onClick={() =>
                              handleStarClick(
                                item.universeCollectableId,
                                collectionId
                              )
                            }
                          >
                            {wishlistIds.includes(
                              item.universeCollectableId
                            ) ? (
                              <FontAwesomeIcon
                                icon={faSolidStar}
                                style={{ color: "#EDC307" }}
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faRegularStar}
                                style={{ color: "#EDC307" }}
                              />
                            )}
                          </button>
                          <div className="h-24 w-24">
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
                              width={100}
                              height={100}
                              className="rounded-md shadow-sm object-cover"
                              onClick={() => handleOpenModal(item)}
                            />
                          </div>

                          <div className="flex-1">
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
                          <div className="flex space-x-4">
                            <button
                              className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                              onClick={() => openEdit(item)}
                            >
                              <FaRegEdit />
                            </button>
                            <button
                              className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                              onClick={() => handleDelete(item)}
                            >
                              <FaRegTrashCan />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
                    {(_searchResults.length > 0
                      ? _searchResults
                      : collectables
                    ).map((item) => (
                      <div key={item.universeCollectableId}>
                        <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                          <div className="h-22 w-30">
                            <div className="absolute top-2 right-2 flex space-x-2">
                              <button
                                className="text-3xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                                onClick={() =>
                                  handleStarClick(
                                    item.universeCollectableId,
                                    collectionId
                                  )
                                }
                              >
                                {wishlistIds.includes(
                                  item.universeCollectableId
                                ) ? (
                                  <FontAwesomeIcon
                                    icon={faSolidStar}
                                    style={{ color: "#EDC307" }}
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faRegularStar}
                                    style={{ color: "#EDC307" }}
                                  />
                                )}
                              </button>
                            </div>
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
                              onClick={() => handleOpenModal(item)}
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

                            <div className="pt-3 pb-2 text-center">
                              <button
                                className="w-fit px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                                onClick={() => openEdit(item)}
                              >
                                <FaRegEdit />
                              </button>
                              <button className="w-fit ml-4 px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                                onClick={() => handleDelete(item)}>
                                <FaRegTrashCan />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  ref={collectableRef}
                  className="loading-indicator text-center p-4"
                >
                  {isFetchingCollectables && <p>Loading more items...</p>}
                </div>
                <div
                  ref={searchRef}
                  className="loading-indicator text-center p-4"
                >
                  {isFetchingSearchResults && <p>Loading more items...</p>}
                </div>
              </div>
            )}
            {/* send data to modal */}
            {showModal && specificTag && (
              <Modal
                itemData={specificTag}
                onClose={handleCloseModal}
                isVisible={showModal}
              />
            )}
            {showEdit && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:w-3/4 lg:w-[480px] max-h-screen overflow-y-auto mt-20">
                  <h2 className="text-xl font-bold mb-4 dark:text-gray-300">
                    Edit your Collectible
                  </h2>

                  <form onSubmit={handleEditSubmit}>
                    {favoriteAttributes
                      .concat(customAttributes)
                      .concat("owned", "image")
                      .filter((attr) => attr !== null)
                      .map((attribute, index) => (
                        <div key={index} className="mb-4 lg:max-w-lg">
                          {attribute !== "image" ? (
                                attribute === "owned" ? (
                                  <div className="flex items-center mb-3">
                                    <input
                                      type="checkbox"
                                      id="publishCollection"
                                      onChange={(e) => handleOwnedChange(e.target.checked)}
                                      className="h-5 w-5 text-primary border-gray-300 rounded mr-2"
                                    />
                                    <label
                                      htmlFor="publishCollection"
                                      className="text-gray-700 dark:text-gray-300 text-sm font-bold"
                                    >
                                      Is Owned
                                    </label>
                                  </div>
                                ) : (
                                  <>
                                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                                      {attribute.charAt(0).toUpperCase() + attribute.slice(1)}
                                    </label>
                                    <input
                                      type="text"
                                      name={attribute}
                                      placeholder={`${attribute}`}
                                      value={formData[attribute] || ""}
                                      onChange={handleChange}
                                      className="border rounded w-full py-2 px-3 text-gray-700"
                                    />
                                  </>
                                )
                              ) : (
                                <>
                                  <label
                                    htmlFor="cover-photo"
                                    className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                                  >
                                    Upload Photo
                                  </label>
                                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 dark:bg-slate-300 px-6 py-10">
                                    <div className="text-center">
                                      <PhotoIcon
                                        aria-hidden="true"
                                        className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-400"
                                      />
                                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                        <label
                                          htmlFor="file-upload"
                                          className="relative cursor-pointer rounded-md px-2 bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                        >
                                          <span>Upload a photo</span>
                                          <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            onChange={handleFileChange}
                                          />
                                        </label>
                                        <p>or drag and drop</p>
                                      </div>
                                      <p className="text-xs leading-5 text-gray-600">PNG, JPG</p>
                                    </div>
                                  </div>
                                </>
                              )}
                        </div>
                      ))}
                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id="publishCollection"
                          checked={isPublished}
                          onChange={handlePublishChange}
                          className="h-5 w-5 text-primary border-gray-300 rounded mb-2 mr-2"
                        />
                        <label
                          htmlFor="publishCollection"
                          className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        >
                          Publish Collectable
                        </label>
                      </div>

                    <div className="flex justify-end space-x-4 mt-8">
                      <button
                        type="button"
                        onClick={closeEdit}
                        className="bg-gray-300 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-xl"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
