import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import _, { divide, get, set } from "lodash";

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
import { useVirtualizer } from "@tanstack/react-virtual";

import { buildPath } from "../utils/utils";
import {
  fetchUniverseCollectables,
  fetchUniverseSearchResults,
  fetchOwnedCollectables,
  fetchOwnedSearchResults,
  addToWishlist,
  removeFromWishlist,
  fetchUniverseJumpResults,
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [resetDropdown, setResetDropdown] = useState(true);
  const [jumpSearchResults, setJumpSearchResults] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [specificTag, setSpecificTag] = useState<Record<string, any> | null>(
    null
  );
  const [isCollectionOwned, setIsCollectionOwned] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // new collectible
  const [showEdit, setShowEdit] = useState(false); // edit collectible
  const [selectedSort, setSelectedSort] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "grid">("grid");
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({ owned: "F" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  const [userId, setUserId] = useState<any>(null);
  const [JWT, setJWT] = useState<string>("");
  const { universeCollectionId } = useParams<{
    universeCollectionId: string;
  }>();
  const [collectionId, setCollectionId] = useState<string>();
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [maskedAttributes, setMaskedAttributes] = useState<string[]>([]);
  const [customAttributes, setCustomAttributes] = useState<string[]>([]);
  const [favoriteAttributes, setFavoriteAttributes] = useState<string[]>([]);
  const [hiddenAttributes, setHiddenAttributes] = useState<string[]>([]);
  const [universeCollectionName, setUniverseCollectionName] = useState("");
  const [universeCollectables, setUniverseCollectables] = useState<any[]>([]);
  const [ownedCollectables, setOwnedCollectables] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  const [noSearchResults, setNoSearchResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTags, setSearchTags] = useState<
    { attribute: string; term: string }[]
  >([]);
  const [jumpSearchTags, setJumpSearchTags] = useState<
    { attribute: string; term: string }[]
  >([]);

  const [jumpPageNumber, setJumpPageNumber] = useState<number>();
  const [nextPageNumber, setNextPageNumber] = useState<number>();
  const [prevPageNumber, setPrevPageNumber] = useState<number>();
  const [loadedPages, setLoadedPages] = useState(new Set<number>());
  const navigate = useNavigate();

  useEffect(() => {
    const collectionIDInStorage = localStorage.getItem("collectionId") ?? "";
    setCollectionId(collectionIDInStorage);
  }, []);

  useEffect(() => {
    // Gather user data from local storage
    const getItemsFromStorage = async () => {
      // Getting the collection name and collection ids from local storage
      const collectionName = localStorage.getItem("collectionName") ?? "";
      const storedCollectionIds = localStorage.getItem("collectionIds") ?? "";
      const savedWishlist = localStorage.getItem("wishlistIds");

      // Setting the collection name and collection ids
      setUniverseCollectionName(collectionName);
      setCollectionIds(JSON.parse(storedCollectionIds));

      // Checking if the collection is owned
      // If the collection is owned, set the state to true
      if (
        universeCollectionId &&
        JSON.parse(storedCollectionIds).some(
          ([colId, uniId]: [string, string]) => {
            return (
              colId.toString() === collectionId &&
              uniId.toString() === universeCollectionId
            );
          }
        )
      ) {
        setIsCollectionOwned(true);
      }

      // Setting the wishlist items
      if (savedWishlist) {
        setWishlistIds(JSON.parse(savedWishlist));
      }
    };

    getItemsFromStorage();
    setSearchResults([]);
    setJumpSearchResults([]);
    setResetDropdown(true);

    // fetch user details and token
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
      const response = await fetch(
        buildPath(`collectable-attributes/masked-attributes/${collectionId}`),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMaskedAttributes(data);
      } else {
        console.error("Error fetching attributes:", response);
      }
    };
    getAttributes();

    const getFavoriteAttributes = async () => {
      const favReponse = await fetch(
        buildPath(
          `collectable-attributes/get-favorite-attributes?collectionId=${collectionId}`
        ),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      if (favReponse.ok) {
        const data = await favReponse.json();
        console.log("Favorite Attributes: ", data[0].favoriteAttributes);
        setFavoriteAttributes(data[0].favoriteAttributes);
        const allAttributes = data[0].favoriteAttributes.concat(
          maskedAttributes.filter(
            (attr) => !data[0].favoriteAttributes.includes(attr)
          )
        );
        console.log("All Attributes: ", allAttributes);
        setMaskedAttributes(allAttributes);
      } else {
        console.error("Error fetching favorite attributes:", favReponse);
      }
    };
    getFavoriteAttributes();
  }, [collectionId, universeCollectionId]);

  useEffect(() => {
    localStorage.setItem("wishlistIds", JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
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

  // -------------------------- show universecollectables and search ------------------

  useEffect(() => {
    const getUniverseCollectionId = async () => {
      if (collectionId) {
        const ownedCollectables = await fetchOwnedCollectables(
          collectionId,
          initialPage,
          ITEMS_PER_PAGE
        );
        setOwnedCollectables(ownedCollectables);

        if (universeCollectionId) {
          const universe_collectables = await fetchUniverseCollectables(
            universeCollectionId,
            initialPage,
            ITEMS_PER_PAGE
          );
          setUniverseCollectables(universe_collectables);
        }
      }
    };

    getUniverseCollectionId();
  }, [collectionId]);

  // add collectible form modal open handler
  const openModal = () => {
    setIsModalOpen(true);
    console.log("attributes", maskedAttributes);
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
    if (confirm("Are you sure you want to delete this item?")) {
      const request = {
        universeCollectableId: item.universeCollectableId,
      };
      console.log("Request: ", request);

      try {
        const response = await fetch(
          buildPath(`universe-collectable/delete-universe-collectable`),
          {
            method: "DELETE",
            body: JSON.stringify(request),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT}`,
            },
          }
        );

        if (response.ok) {
          console.log("Item deleted successfully");
          window.location.reload();
        } else {
          console.error("Error deleting item:", response);
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    } else {
      return;
    }
  };

  const handleAddToMyCollections = async () => {
    const request = {
      collectionUniverseId: universeCollectionId,
      userEmail: userId.loginId,
    };
    console.log("Request: ", request);

    try {
      const response = await fetch(
        buildPath(`collection-universe/copy-universe`),
        {
          method: "POST",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      if (response.ok) {
        console.log("Collection added successfully");
        setIsCollectionOwned(true);
      } else {
        console.error("Error adding collection:", response);
      }
    } catch (error) {
      console.error("Error adding collection:", error);
    }
  };

  // -------------- handle star click-------------------

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
      if (universeCollectionId) {
        addToWishlist(universeCollectionId, universeCollectableId);
      } else {
        console.error("universeCollectionId is null");
      }
    }
  };

  //--------------------- handle form field ------------------------
  // handle form field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleOwnedChange = (owned: boolean) => {
    setFormData((prevData) => ({ ...prevData, ["owned"]: owned ? "T" : "F" }));
  };

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
    console.log(
      "universe collectable id: ",
      specificTag?.universeCollectableId
    );
    const { owned, image, ...restFormData } = formData;
    console.log("owned", owned);
    request.append("attributeValuesJson", JSON.stringify(restFormData));
    if (owned) {
      request.append("owned", owned);
    } else {
      request.append("owned", "F");
    }
    if (imageFile) {
      request.append("collectableImage", imageFile);
    } else {
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
    window.location.reload();
  };

  const logFormData = (formData: FormData) => {
    const formDataEntries: Record<string, any> = {};
    formData.forEach((value, key) => {
      formDataEntries[key] = value;
    });
    console.log("FormData Contents:", formDataEntries);
  };

  // ------------------------ open card for details -----------------------------------
  const handleOpenModal = (item: Record<string, any>) => {
    setSpecificTag(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSpecificTag(null);
  };

  const deleteCollection = async () => {
    console.log("Delete collection clicked");
    console.log("Collection ID: ", universeCollectionId);
    if (confirm("Are you sure you want to delete this collection?")) {
      const request = {
        id: universeCollectionId,
      };
      console.log("Request: ", request);

      try {
        const response = await fetch(
          buildPath(`collection-universe/delete-universe`),
          {
            method: "DELETE",
            body: JSON.stringify(request),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT}`,
            },
          }
        );

        if (response.ok) {
          console.log("Collection deleted successfully");
          navigate("/collections");
        } else {
          console.error("Error deleting collection:", response);
        }
      } catch (error) {
        console.error("Error deleting collection:", error);
      }
    } else {
      return;
    }
  };

  const handleSearchResults = (results: any[]) => {
    if (results.length === 0) {
      setNoSearchResults(true);
    } else {
      setNoSearchResults(false);
      setSearchResults(results);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    console.log("search result: ", searchResults);
    setJumpSearchResults([]);
    console.log("jump results: ", jumpSearchResults);
    setResetDropdown(true);
    setNoSearchResults(false);
  };

  const { ref: collectableRef, entry: collectableEntry } = useIntersection({
    threshold: 1,
  });
  const { ref: searchRef, entry: searchEntry } = useIntersection({
    threshold: 1,
  });
  const { ref: jumpNextRef, entry: jumpNextEntry } = useIntersection({
    threshold: 1,
  });
  const { ref: jumpPrevRef, entry: jumpPrevEntry } = useIntersection({
    threshold: 0.1,
  });

  const handleToggleChange = (enabled: boolean) => {
    setEnabled(enabled);
    handleClearSearch();
    setCurrentPage(1);
    setJumpSearchResults([]);
    setSearchResults([]);
  };

  const {
    data: collectablesData,
    fetchNextPage: fetchCollectablesNextPage,
    hasNextPage: hasMoreCollectables,
    isFetchingNextPage: isFetchingCollectables,
  } = useInfiniteQuery({
    queryKey: ["collectables", collectionId, universeCollectionId, enabled],
    queryFn: ({ pageParam = 1 }) => {
      if (enabled) {
        return fetchOwnedCollectables(collectionId!, pageParam, ITEMS_PER_PAGE);
      } else if (universeCollectionId) {
        return fetchUniverseCollectables(
          universeCollectionId,
          pageParam,
          ITEMS_PER_PAGE
        );
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (
        !lastPage ||
        !Array.isArray(lastPage) ||
        lastPage.length < ITEMS_PER_PAGE
      ) {
        return undefined;
      }
      return allPages.length + 1;
    },
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

  // Used when mounting the page. This means no Search or Jump Results have been made yet.
  const _default_collectables =
    collectablesData?.pages.flatMap((page) => page) ?? [];

  //console.log("_default_collectables: ", _default_collectables);

  const handleSearch = async (
    searchTags: { attribute: string; term: string }[]
  ) => {
    setSearchTags(searchTags);
    setSearchResults([]);
    fetchSearchNextPage();
  };

  const {
    data: searchResultsData,
    fetchNextPage: fetchSearchNextPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingSearchResults,
  } = useInfiniteQuery({
    queryKey: ["searchResults", searchTags, enabled],
    queryFn: ({ pageParam = 1 }) => {
      if (enabled && collectionId) {
        return fetchOwnedSearchResults(
          searchTags,
          userId,
          collectionId,
          pageParam
        );
      } else if (universeCollectionId) {
        return fetchUniverseSearchResults(
          searchTags,
          userId,
          universeCollectionId,
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

  const handleJump = async (
    jumpTags: { attribute: string; term: string }[]
  ) => {
    setJumpSearchTags(jumpTags);
    setJumpSearchResults([]);
    setLoadedPages(new Set());

    try {
      const res = await fetchUniverseJumpResults(
        jumpTags,
        userId,
        universeCollectionId!
      );

      console.log(res); // this return the matched item and page number
      if (res) {
        setJumpPageNumber(res.pageNumber);
        setPrevPageNumber(res.pageNumber - 1);
        setNextPageNumber(res.pageNumber + 1);

        // use the page number to fetch items on that page
        const data = await fetchUniverseCollectables(
          universeCollectionId!,
          res.pageNumber,
          ITEMS_PER_PAGE
        );
        setJumpSearchResults(data);

        setLoadedPages(new Set([res.pageNumber]));
      }
      // setJumped(true); // Set `jumped` to true to indicate the initial jump has occurred
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleLoadFromJumpPage = async () => {
    if (!nextPageNumber || loadedPages.has(nextPageNumber)) return;
    try {
      const data = await fetchUniverseCollectables(
        universeCollectionId!,
        nextPageNumber,
        ITEMS_PER_PAGE
      );
      setJumpSearchResults((prevResults) => [...prevResults, ...data]);
      setNextPageNumber((prev) => prev! + 1);
    } catch (error) {
      console.error("Error fetching additional pages:", error);
    }
  };

  const handleLoadPreviousJumpPage = async () => {
    // if there is no previous page or it has already been loaded, return
    if (!prevPageNumber || loadedPages.has(prevPageNumber)) return;

    // fetch the previous page
    try {
      const data = await fetchUniverseCollectables(
        universeCollectionId!,
        prevPageNumber,
        ITEMS_PER_PAGE
      );
      setJumpSearchResults((prevResults) => [...data, ...prevResults]);
      setPrevPageNumber((prev) => prev! - 1);
    } catch (error) {
      console.error("Error fetching previous page items:", error);
    }
  };

  useEffect(() => {
    if (jumpNextEntry?.isIntersecting) {
      handleLoadFromJumpPage();
    }
  }, [jumpNextEntry]);

  useEffect(() => {
    if (jumpPrevEntry?.isIntersecting) {
      handleLoadPreviousJumpPage();
    }
  }, [jumpPrevEntry]);

  const handleReset = () => {
    setSearchResults([]);
    setJumpSearchResults([]);
    setResetDropdown(true);
    setNoSearchResults(false);
    // setJumped(false); // Reset `jumped` to false, this is for adjusting scroll position when items are added while scrolling up. When `jumped` is true, the initial jump has occurred
    // setPrevHeight(0); // Reset the previous height, this is for adjusting scroll position when items are added while scrolling up
  };

  // =======================Using Virtualizer instead of UseIntersection====================
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevHeight, setPrevHeight] = useState(0);
  const [jumped, setJumped] = useState(false); // Track if "Jump" was clicked
  // THIS WORKS BUT VERY SIMPLE
  // useEffect(() => {
  //   if (scrollRef && scrollRef.current) {
  //     scrollRef.current.scrollTop = 500; // Set initial scroll position to 100px
  // } }, [jumpSearchResults]);

  useLayoutEffect(() => {
    // Set initial scroll position when jump results first load
    if (scrollRef.current && jumped && jumpSearchResults.length > 0) {
      // Set the scroll to 30px from the top on the initial jump
      scrollRef.current.scrollTop = 30;
      // smoothScroll(scrollRef.current, 50, 500); // Smoothly scroll to 30px from the top
      setJumped(false); // Reset jumped after the initial adjustment
    }
  }, [jumpSearchResults, jumped]);

  const smoothScroll = (
    element: HTMLElement,
    target: number,
    duration: number
  ): void => {
    const start = element.scrollTop;
    const distance = target - start;

    if (distance === 0 || duration <= 0) return; // Exit if no scrolling is needed

    let startTime: number | null = null;

    function animation(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1); // Cap progress at 1 (100%)

      // Calculate and set the scroll position
      element.scrollTop = start + distance * progress;

      // Continue the animation until complete
      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        console.log("Scrolling complete");
      }
    }

    console.log(
      `Starting smooth scroll from ${start} to ${target} over ${duration}ms`
    );
    requestAnimationFrame(animation);
  };

  // This effect runs when items are added while scrolling up, to adjust the scroll position
  useLayoutEffect(() => {
    if (scrollRef.current && prevHeight !== 0 && !jumped) {
      // Measure the new height after items are updated
      const newHeight = scrollRef.current.scrollHeight;
      const heightDifference = (newHeight - prevHeight) * 1.35;

      // Adjust scroll position by the height difference to keep it centered
      scrollRef.current.scrollTop += heightDifference / 2;
      // smoothScroll(scrollRef.current, scrollRef.current.scrollTop + heightDifference / 2, 50);
      setPrevHeight(newHeight); // Update `prevHeight` to the current height
    } else if (scrollRef.current && prevHeight === 0) {
      // Capture the initial height when prevHeight is 0
      setPrevHeight(scrollRef.current.scrollHeight);
    }
  }, [jumpSearchResults, prevHeight, jumped]);

  return (
    <>
      <div className="h-screen flex flex-col overflow-y-hidden">
        <div className="top-0 z-50 bg-white dark:bg-gray-800 w-full  relative">
          <Header />
          <div className="w-full mx-auto pt-8">
            <div className="mx-auto pl-10">
              <div className="flex md:items-center justify-center gap-48 pb-4 max-md:px-4  ">
                {/* collection option */}
                <div className="flex items-center gap-4 ml-0">
                  <p className="font-bold text-xl w-fit text-black bg-yellow-300 rounded-full px-4 py-3">
                    {universeCollectionName}
                  </p>
                  <OwnedToggle
                    enabled={enabled}
                    setEnabled={setEnabled}
                    onToggle={handleToggleChange}
                  />
                </div>

                {/* Search bar */}
                {universeCollectionId && (
                  <SearchBar
                    attributes={maskedAttributes}
                    onSearchResults={handleSearchResults}
                    // onResetSearch={() => setSearchResults([])}
                    resetDropdown={resetDropdown}
                    onResetSearch={handleReset}
                    setResetDropdown={setResetDropdown}
                    onSearch={handleSearch}
                    onJump={handleJump}
                  />
                )}

                {/* icon button for view hidden lg:block md:block*/}
                <div className="hidden lg:block md:block pt-3 mt-3">
                  <button className="pr-5" onClick={() => setView("list")}>
                    <FaListUl />
                  </button>
                  <button className="pr-16" onClick={() => setView("grid")}>
                    <BsFillGridFill />
                  </button>
                  {isCollectionOwned ? (
                    <div className="dropdown">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full w-fit"
                      >
                        Edit Collection
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                      >
                        <li>
                          <a
                            className="text-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={openModal}
                          >
                            New Collectable
                          </a>
                        </li>

                        <li>
                          <Link
                            className="text-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                            to={`/bulk-upload/${collectionId}`}
                          >
                            Bulk Upload
                          </Link>
                        </li>

                        <li>
                          <Link
                            className="text-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                            to={`/bulk-edit/${universeCollectionId}`}
                          >
                            Bulk Edit
                          </Link>
                        </li>

                        <li>
                          <a
                            className="text-lg hover:bg-red-400 hover:text-black"
                            onClick={deleteCollection}
                          >
                            Delete Collection
                          </a>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    //   <button
                    //     className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full w-fit"
                    //     onClick={openModal}
                    //   >
                    //     New Collectible
                    //     <IoIosAdd />
                    //   </button>
                    //   <Link
                    //     className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full w-fit ml-5"
                    //     to={`/bulk-upload/${collectionId}`}
                    //   >
                    //     Bulk Upload
                    //     <IoIosAdd />
                    //   </Link>
                    //   <button
                    //     className="btn text-lg text-black bg-yellow-300 hover:bg-red-500 rounded-full w-fit ml-5"
                    //     onClick={deleteCollection}
                    //   >
                    //     Delete Collection
                    //   </button>
                    // </div>
                    <button
                      className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full w-fit"
                      onClick={handleAddToMyCollections}
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
                          {maskedAttributes
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
                                        onChange={(e) =>
                                          handleOwnedChange(e.target.checked)
                                        }
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
                                        {attribute.charAt(0).toUpperCase() +
                                          attribute.slice(1)}
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
                                        <p className="text-xs leading-5 text-gray-600">
                                          PNG, JPG
                                        </p>
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 w-full overflow-y-auto p-4 relative "
          // style={{ scrollBehavior: 'smooth' }}
          style={{ maxHeight: "100vh" }} // Allows dynamic growth without hard limit
        >
          {/* Scrollable Content goes here */}
          <div className="h-fit bg-gray-100">
            {/* Add more content to enable scrolling */}
            <div className=" border-2 border-dashed border-red-500 ">
              {/* <div className="h-[400px]">
                <div
                  ref={jumpPrevRef}
                  className="loading-indicator text-center p-4 bg-black"
                ></div>
              </div> */}
              {/* <div
                ref={jumpPrevRef}
                className="loading-indicator text-center bg-red-700 p-2 mb-[70px]"
              ></div> */}

              <div className="w-full flex flex-col md:flex-row border-2 border-dashed border-purple-500">
                {/* collectibles */}
                <div className="w-full p-2">
                  {/* <div className="text-xl py-4 text-right pr-10">
                    Total items in the collection:{" "}
                  </div> */}

                  {/* {showLoadPreviousButton && (
                    <button onClick={handleLoadPreviousPage}>
                      Load Previous Items
                    </button>
                  )} */}

                  {typeof prevPageNumber === "number" &&
                  prevPageNumber > 0 &&
                  !loadedPages.has(prevPageNumber) ? (
                    <div
                      ref={jumpPrevRef}
                      className="loading-indicator text-center bg-red-700 p-1 mb-[30px]"
                    >
                      {/* Optionally add loading content */}
                    </div>
                  ) : (
                    <div className="loading-indicator text-center bg-red-700 p-1 mb-[30px]">
                      {/* Optionally add loading content */}
                    </div>
                  )}

                  {noSearchResults ? (
                    <div className="pt-28 text-center w-full text-2xl font-extrabold text-gray-600">
                      No match found :(
                    </div>
                  ) : (
                    <div className="w-full p-2 border-2 border-dashed border-yellow-500">
                      {/* DEFAULT COLLECTABLE RESULTS 
                        i.e what is shown when mounting onto the page */}
                      {
                        // If there are no search results and no jump search results, show the default collectables
                        _searchResults.length === 0 &&
                          jumpSearchResults.length === 0 &&
                          // If the view is list, show the list view
                          (view === "list" ? (
                            <div className="flex flex-wrap -mx-4 ">
                              {_default_collectables.map((item) => (
                                <div
                                  key={`${item.universeCollectableId}-default-search`}
                                  className="w-full md:w-1/2 px-4 mb-6 bg-green-500"
                                >
                                  <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl">
                                    <button
                                      className="text-3xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                                      onClick={() =>
                                        handleStarClick(
                                          item.universeCollectionId!,
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
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/placeholder.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
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
                                        .map(
                                          (attribute: any, index: number) => (
                                            <p
                                              key={`${
                                                attribute.slug || attribute.name
                                              }-default-search`}
                                              className={
                                                index === 0
                                                  ? "mt-4 text-lg font-bold pl-4 uppercase truncate"
                                                  : "text-md font-semibold pl-4 capitalize truncate"
                                              }
                                            >
                                              {`${attribute.value}`}
                                            </p>
                                          )
                                        )}
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
                            // GRID VIEW
                            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4 border-2 border-dashed border-blue-500">
                              {_default_collectables.map((item) => (
                                <div
                                  key={`${item.universeCollectableId}-default-search`}
                                >
                                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl bg-green-500">
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
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/placeholder.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
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
                                        .map(
                                          (attribute: any, index: number) => (
                                            <p
                                              key={`${
                                                attribute.slug || attribute.name
                                              }-default-search`}
                                              className={
                                                index === 0
                                                  ? "mt-4 text-lg font-bold pl-4 uppercase truncate"
                                                  : "text-md font-semibold pl-4 capitalize truncate"
                                              }
                                            >
                                              {`${attribute.value}`}
                                            </p>
                                          )
                                        )}

                                      <div className="pt-3 pb-2 text-center">
                                        <button
                                          className="w-fit px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                                          onClick={() => openEdit(item)}
                                        >
                                          <FaRegEdit />
                                        </button>
                                        <button
                                          className="w-fit ml-4 px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                                          onClick={() => handleDelete(item)}
                                        >
                                          <FaRegTrashCan />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))
                      }

                      {/* SEARCH RESULTS */}
                      {
                        // If there are search results, show the search results
                        _searchResults.length > 0 &&
                          // If the view is list, show the list view
                          (view === "list" ? (
                            <div className="flex flex-wrap -mx-4 ">
                              {_searchResults.map((item) => (
                                <div
                                  key={`${item.universeCollectableId}-search`}
                                  className="w-full md:w-1/2 px-4 mb-6 bg-blue-500"
                                >
                                  <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl">
                                    <button
                                      className="text-3xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                                      onClick={() =>
                                        handleStarClick(
                                          item.universeCollectionId!,
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
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/placeholder.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
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
                                        .map(
                                          (attribute: any, index: number) => (
                                            <p
                                              key={`${
                                                attribute.slug || attribute.name
                                              }-search`}
                                              className={
                                                index === 0
                                                  ? "mt-4 text-lg font-bold pl-4 uppercase truncate"
                                                  : "text-md font-semibold pl-4 capitalize truncate"
                                              }
                                            >
                                              {`${attribute.value}`}
                                            </p>
                                          )
                                        )}
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
                            // GRID VIEW
                            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4 border-2 border-dashed border-blue-500">
                              {_searchResults.map((item) => (
                                <div
                                  key={`${item.universeCollectableId}-search`}
                                >
                                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl bg-blue-500">
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
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/placeholder.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
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
                                        .map(
                                          (attribute: any, index: number) => (
                                            <p
                                              key={`${
                                                attribute.slug || attribute.name
                                              }-search`}
                                              className={
                                                index === 0
                                                  ? "mt-4 text-lg font-bold pl-4 uppercase truncate"
                                                  : "text-md font-semibold pl-4 capitalize truncate"
                                              }
                                            >
                                              {`${attribute.value}`}
                                            </p>
                                          )
                                        )}

                                      <div className="pt-3 pb-2 text-center">
                                        <button
                                          className="w-fit px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                                          onClick={() => openEdit(item)}
                                        >
                                          <FaRegEdit />
                                        </button>
                                        <button
                                          className="w-fit ml-4 px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                                          onClick={() => handleDelete(item)}
                                        >
                                          <FaRegTrashCan />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))
                      }

                      {/* JUMP RESULTS */}
                      {
                        // If there are jump search results, show the jump search results
                        jumpSearchResults.length > 0 &&
                          // If the view is list, show the list view
                          (view === "list" ? (
                            <div className="flex flex-wrap -mx-4 ">
                              {jumpSearchResults.map((item) => (
                                <div
                                  key={`${item.universeCollectableId}-jump`}
                                  className="w-full md:w-1/2 px-4 mb-6 bg-yellow-500"
                                >
                                  <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl">
                                    <button
                                      className="text-3xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                                      onClick={() =>
                                        handleStarClick(
                                          item.universeCollectionId!,
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
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/placeholder.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
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
                                        .map(
                                          (attribute: any, index: number) => (
                                            <p
                                              key={`${
                                                attribute.slug || attribute.name
                                              }-jump`}
                                              className={
                                                index === 0
                                                  ? "mt-4 text-lg font-bold pl-4 uppercase truncate"
                                                  : "text-md font-semibold pl-4 capitalize truncate"
                                              }
                                            >
                                              {`${attribute.value}`}
                                            </p>
                                          )
                                        )}
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
                            // GRID VIEW
                            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4 border-2 border-dashed border-blue-500">
                              {jumpSearchResults.map((item) => (
                                <div key={`${item.universeCollectableId}-jump`}>
                                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl bg-yellow-500">
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
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/placeholder.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
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
                                        .map(
                                          (attribute: any, index: number) => (
                                            <p
                                              key={`${
                                                attribute.slug || attribute.name
                                              }-jump`}
                                              className={
                                                index === 0
                                                  ? "mt-4 text-lg font-bold pl-4 uppercase truncate"
                                                  : "text-md font-semibold pl-4 capitalize truncate"
                                              }
                                            >
                                              {`${attribute.value}`}
                                            </p>
                                          )
                                        )}

                                      <div className="pt-3 pb-2 text-center">
                                        <button
                                          className="w-fit px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                                          onClick={() => openEdit(item)}
                                        >
                                          <FaRegEdit />
                                        </button>
                                        <button
                                          className="w-fit ml-4 px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                                          onClick={() => handleDelete(item)}
                                        >
                                          <FaRegTrashCan />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))
                      }

                      {/* DO NOT GO FURTHER */}
                      <div
                        ref={collectableRef}
                        className="loading-indicator text-center bg-green-500 p-1"
                      >
                        {isFetchingCollectables && <p>Loading more items...</p>}
                      </div>
                      <div
                        ref={searchRef}
                        className="loading-indicator text-center bg-green-500 p-1"
                      >
                        {isFetchingSearchResults && (
                          <p>Loading more items...</p>
                        )}
                      </div>
                      <div
                        ref={jumpNextRef}
                        className="loading-indicator text-center bg-green-500 p-1"
                      ></div>
                    </div>
                  )}

                  {/* Show All the details about an item in the modal*/}
                  {showModal && specificTag && (
                    <Modal
                      itemData={specificTag}
                      onClose={handleCloseModal}
                      isVisible={showModal}
                    />
                  )}

                  {/* Show Edit Collectable Form */}
                  {showEdit && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:w-3/4 lg:w-[480px] max-h-screen overflow-y-auto mt-20">
                        <h2 className="text-xl font-bold mb-4 dark:text-gray-300">
                          Edit your Collectible
                        </h2>

                        <form onSubmit={handleEditSubmit}>
                          {maskedAttributes
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
                                        onChange={(e) =>
                                          handleOwnedChange(e.target.checked)
                                        }
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
                                        {attribute.charAt(0).toUpperCase() +
                                          attribute.slice(1)}
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
                                        <p className="text-xs leading-5 text-gray-600">
                                          PNG, JPG
                                        </p>
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
          </div>
        </div>
      </div>
    </>
  );
}
