import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import _ from "lodash";

import { FaListUl } from "react-icons/fa";
import { BsFillGridFill } from "react-icons/bs";
import { IoIosAdd } from "react-icons/io";

import Header from "../Components/Header";
import Modal from "../Components/Modal";
import Footer from "../Components/Footer";
import SearchBar from "../Components/searchBar";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersection } from "@mantine/hooks";

import { buildPath } from "../utils/utils";
import {
  fetchUniverseCollectables,
  fetchOwnedCollectables,
  fetchOwnedSearchResults,
  fetchOwnedJumpResults,
} from "../utils/ItemsPage";
import {
  fetchPublicUniverseCollectables,
  fetchPublicUniverseJumpResults,
  fetchPublicUniverseSearchResults,
} from "../utils/universeItemPage";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import fetchJWT from "../fetchJWT";

const ITEMS_PER_PAGE = 12;
const initialPage = 1;

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [resetDropdown, setResetDropdown] = useState(true);
  const [jumpSearchResults, setJumpSearchResults] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [specificTag, setSpecificTag] = useState<Record<string, any> | null>(
    null
  );
  const [isCollectionOwned, setIsCollectionOwned] = useState(false);
  const [view, setView] = useState<"list" | "grid">("grid");
  const [formData, setFormData] = useState<Record<string, any>>({ owned: "F" });

  const isOwnedMap = new Map<string, boolean>();

  const [userId, setUserId] = useState<any>(null);
  const [JWT, setJWT] = useState<string>("");
  const { universeCollectionId } = useParams<{
    universeCollectionId: string;
  }>();
  const [collectionId, setCollectionId] = useState<string>();
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [maskedAttributes, setMaskedAttributes] = useState<string[]>([]);
  const [favoriteAttributes, setFavoriteAttributes] = useState<string[]>([]);
  const [universeCollectionName, setUniverseCollectionName] = useState("");
  const [universeCollectables, setUniverseCollectables] = useState<any[]>([]);
  const [ownedCollectables, setOwnedCollectables] = useState<any[]>([]);

  const [enabled, setEnabled] = useState(false);

  const [wishlistIds, setWishlistIds] = useState<number[]>(() =>
    JSON.parse(localStorage.getItem("wishlistIds") || "[]")
  );

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
  const [highlightedItemId, setHighlightedItemId] = useState<number | null>(
    null
  );
  const [ownedHighlightedItemId, setOwnedHighlightedItemId] = useState<
    number | null
  >(null);
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
        console.log("Masked Attributes: ", data);
      } else {
        console.error("Error fetching attributes:", response);
      }
    };
    getAttributes();

    const getFavoriteAttributes = async () => {
      // const favReponse = await fetch(
      //   buildPath(
      //     `collectable-attributes/get-favorite-attributes?collectionId=${collectionId}`
      //   ),
      //   {
      //     method: "GET",
      //     headers: {
      //       Authorization: `Bearer ${JWT}`,
      //     },
      //   }
      // );

      const url = buildPath(
        `collectable-attributes/get-favorite-attributes?collectionId=${collectionId}`
      );

      console.log("collectionId: ", collectionId);
      console.log("Fetching URL:", url);

      const favReponse = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      });

      if (favReponse.ok) {
        const data = await favReponse.json();
        setFavoriteAttributes(data[0].favoriteAttributes);
        console.log("Favorite Attributes: ", data[0].favoriteAttributes);
        const allAttributes = data[0].favoriteAttributes.concat(
          maskedAttributes.filter(
            (attr) => !data[0].favoriteAttributes.includes(attr)
          )
        );
        setMaskedAttributes(allAttributes);
        console.log("result: ", allAttributes);
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
    navigate("/collections");
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

  const handleClearSearch = () => {
    setSearchResults([]);
    setJumpSearchResults([]);
    setResetDropdown(true);
    setNoSearchResults(false);
    setJumped(false); // Reset `jumped` to false, this is for adjusting scroll position when items are added while scrolling up. When `jumped` is true, the initial jump has occurred
    setPrevHeight(0); // Reset the previous height, this is for adjusting scroll position when items are added while scrolling up
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

  // -------------------------- show universecollectables and search ------------------
  const [sortOrder, setSortOrder] = useState<string>("ascending");
  const [sortBy, setSortBy] = useState<string>("");

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
    console.log("Sort Order:", order);
    fetchCollectablesNextPage();
  };

  const handleSortByChange = (attribute: string) => {
    setSortBy(attribute);
    console.log("Sort By:", attribute);
    fetchCollectablesNextPage();
  };

  const {
    data: collectablesData,
    fetchNextPage: fetchCollectablesNextPage,
    hasNextPage: hasMoreCollectables,
    isFetchingNextPage: isFetchingCollectables,
  } = useInfiniteQuery({
    queryKey: [
      "collectables",
      collectionId,
      universeCollectionId,
      enabled,
      sortBy,
      sortOrder,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (universeCollectionId) {
        const { collectables, totalMatchingCollectables } =
          await fetchPublicUniverseCollectables(
            universeCollectionId,
            pageParam,
            ITEMS_PER_PAGE,
            sortBy,
            sortOrder
          );
        return { collectables, totalMatchingCollectables };
      }
      // Default empty structure if neither condition is met
      return { collectables: [], totalMatchingCollectables: 0 };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Check if more pages are available based on the total count
      const totalFetched = allPages.flatMap((page) => page.collectables).length;
      return totalFetched < (lastPage?.totalMatchingCollectables || 0)
        ? allPages.length + 1
        : undefined;
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
    collectablesData?.pages.flatMap((page) => page.collectables) || [];

  const handleSearch = async (
    searchTags: { attribute: string; term: string }[]
  ) => {
    setJumpSearchTags([]);
    setJumpSearchResults([]);
    setLoadedPages(new Set());
    setHighlightedItemId(null);
    setJumped(false);
    setPrevHeight(0);

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
    queryKey: [
      "searchResults",
      JSON.stringify(searchTags),
      enabled,
      sortBy,
      sortOrder,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      console.log("searchTags passed to queryFn: ", searchTags);
      if (enabled && collectionId) {
        const { collectables, totalMatchingCollectables } =
          await fetchOwnedSearchResults(
            searchTags,
            userId,
            collectionId,
            pageParam,
            sortBy,
            sortOrder
          );
        return { collectables, totalMatchingCollectables };
      } else if (universeCollectionId) {
        const { collectables, totalMatchingCollectables } =
          await fetchPublicUniverseSearchResults(
            searchTags,
            userId,
            universeCollectionId,
            pageParam,
            sortBy,
            sortOrder
          );
        return { collectables, totalMatchingCollectables };
      }
      return { collectables: [], totalMatchingCollectables: 0 };
    },
    initialPageParam: 1,
    enabled: searchTags.length > 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.flatMap((page) => page.collectables).length;
      return totalFetched < lastPage.totalMatchingCollectables
        ? allPages.length + 1
        : undefined;
    },
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

  const _searchResults =
    searchResultsData?.pages.flatMap((page) => page.collectables) || [];

  const handleJump = async (
    jumpTags: { attribute: string; term: string }[]
  ) => {
    // Clear search result
    setSearchTags([]);
    setSearchResults([]);

    // Set jump-related state
    setJumpSearchTags(jumpTags);
    setJumpSearchResults([]);
    setLoadedPages(new Set());

    try {
      let res;
      if (enabled && collectionId) {
        // Fetch owned jump results when toggle is enabled
        res = await fetchOwnedJumpResults(
          jumpTags,
          userId,
          collectionId,
          sortBy,
          sortOrder
        );
        if (res) {
          console.log("result: ", res);
          // set this matched item to be hightlighted
          setOwnedHighlightedItemId(res.collectable_id);
        }
      } else if (universeCollectionId) {
        // Fetch universe jump results when toggle is disabled
        res = await fetchPublicUniverseJumpResults(
          jumpTags,
          userId,
          universeCollectionId,
          sortBy,
          sortOrder
        );
        if (res) {
          // set this matched item to be hightlighted
          setHighlightedItemId(res.universe_collectable_id);
        }
      }

      if (res) {
        // set the related page number
        setJumpPageNumber(res.pageNumber);
        setPrevPageNumber(res.pageNumber - 1);
        setNextPageNumber(res.pageNumber + 1);

        // fetch items on the specified page
        let data;
        if (enabled && collectionId) {
          data = await fetchOwnedCollectables(
            collectionId,
            res.pageNumber,
            ITEMS_PER_PAGE,
            sortBy,
            sortOrder
          );
        } else if (universeCollectionId) {
          data = await fetchUniverseCollectables(
            universeCollectionId,
            res.pageNumber,
            ITEMS_PER_PAGE,
            sortBy,
            sortOrder
          );
        }

        if (data) {
          setJumpSearchResults(data.collectables);
          setLoadedPages(new Set([res.pageNumber]));
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // fetch next page for jump
  const handleLoadFromJumpPage = async () => {
    if (!nextPageNumber || loadedPages.has(nextPageNumber)) return;

    // if toggle enabled, fetch owned collectables result
    // else, fetch universe collectables result
    try {
      let data;
      if (enabled && collectionId) {
        data = await fetchOwnedCollectables(
          collectionId,
          nextPageNumber,
          ITEMS_PER_PAGE,
          sortBy,
          sortOrder
        );
      } else if (universeCollectionId) {
        data = await fetchUniverseCollectables(
          universeCollectionId,
          nextPageNumber,
          ITEMS_PER_PAGE,
          sortBy,
          sortOrder
        );
      }

      if (data) {
        setJumpSearchResults((prevResults) => [
          ...prevResults,
          ...data.collectables,
        ]);
        setNextPageNumber((prev) => prev! + 1);
      }
    } catch (error) {
      console.error("Error fetching additional pages:", error);
    }
  };

  // fetch previous page for jump
  const handleLoadPreviousJumpPage = async () => {
    if (!prevPageNumber || loadedPages.has(prevPageNumber)) return;

    try {
      let data;
      if (enabled && collectionId) {
        // if toggle enabled, fetch owned collectables result
        // else, fetch universe collectables result
        data = await fetchOwnedCollectables(
          collectionId,
          prevPageNumber,
          ITEMS_PER_PAGE,
          sortBy,
          sortOrder
        );
      } else if (universeCollectionId) {
        data = await fetchUniverseCollectables(
          universeCollectionId,
          prevPageNumber,
          ITEMS_PER_PAGE,
          sortBy,
          sortOrder
        );
      }

      if (data) {
        setJumpSearchResults((prevResults) => [
          ...data.collectables,
          ...prevResults,
        ]);
        setPrevPageNumber((prev) => prev! - 1);
      }
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
    setResetDropdown(true);
    setNoSearchResults(false);
    setJumped(false); // Reset `jumped` to false, this is for adjusting scroll position when items are added while scrolling up. When `jumped` is true, the initial jump has occurred
    setPrevHeight(0); // Reset the previous height, this is for adjusting scroll position when items are added while scrolling up
    window.location.reload();
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
      setPrevHeight(0); // Reset the previous height, this is for adjusting scroll position when items are added while scrolling up
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
      const heightDifference = (newHeight - prevHeight) * 2;

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
        <div className="top-0 z-50 bg-white dark:bg-gray-800 w-full">
          <Header />
          <div className="w-full mx-auto pt-8">
            <div className="mx-auto px-10">
              {/* flex md:items-center gap-28 pb-4 max-md:px-4 w-fit */}
              <div className="">
                {/* collection option */}
                <div className="flex items-center gap-4">
                  <p className="font-bold text-xl w-fit text-black bg-yellow-300 rounded-full px-4 py-3">
                    {universeCollectionName}
                  </p>

                  <div className="flex lg:hidden items-center">
                    <button
                      className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full w-fit"
                      onClick={handleAddToMyCollections}
                    >
                      Add to My Collections
                      <IoIosAdd />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-32">
                  {/* Search bar */}
                  {universeCollectionId && (
                    <SearchBar
                      attributes={maskedAttributes}
                      resetDropdown={resetDropdown}
                      onResetSearch={handleReset}
                      setResetDropdown={setResetDropdown}
                      onSearch={handleSearch}
                      onJump={handleJump}
                      onSortOrder={handleSortOrderChange}
                      onSortBy={handleSortByChange}
                    />
                  )}

                  {/* Buttons for large screens */}
                  <div className="items-center gap-2 pt-5 hidden lg:flex">
                    <button className="pr-5" onClick={() => setView("list")}>
                      <FaListUl />
                    </button>
                    <button className="pr-5" onClick={() => setView("grid")}>
                      <BsFillGridFill />
                    </button>

                    <button
                      className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full w-fit"
                      onClick={handleAddToMyCollections}
                    >
                      Add to My Collections
                      <IoIosAdd />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 w-full overflow-y-auto p-4 relative dark:bg-gray-800"
          // style={{ scrollBehavior: 'smooth' }}
          style={{ maxHeight: "100vh" }} // Allows dynamic growth without hard limit
        >
          {/* Scrollable Content goes here */}
          <div className="h-fit dark:bg-gray-800">
            {/* Add more content to enable scrolling */}
            <div>
              <div className="w-full flex flex-col md:flex-row">
                {/* collectibles */}
                <div className="w-full p-2">
                  {typeof prevPageNumber === "number" &&
                  prevPageNumber > 0 &&
                  !loadedPages.has(prevPageNumber) ? (
                    <div
                      ref={jumpPrevRef}
                      className="loading-indicator text-center p-1 mb-[30px]"
                    >
                      {/* Optionally add loading content */}
                    </div>
                  ) : (
                    <div className="loading-indicator text-center p-1 mb-[30px]">
                      {/* Optionally add loading content */}
                    </div>
                  )}

                  <div className="w-full px-4 py-2 flex justify-end dark:bg-gray-800">
                    {searchTags.length > 0 &&
                    searchResultsData?.pages?.[0]?.totalMatchingCollectables ? (
                      // if there is searchResults, show total count
                      <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
                        Total Matching Search Results:{" "}
                        {searchResultsData.pages[0].totalMatchingCollectables}
                      </p>
                    ) : (
                      // Show total collectables
                      collectablesData?.pages?.[0]
                        ?.totalMatchingCollectables && (
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
                          Total Collectibles:{" "}
                          {collectablesData.pages[0].totalMatchingCollectables}
                        </p>
                      )
                    )}
                  </div>

                  {noSearchResults ? (
                    <div className="pt-28 text-center w-full text-2xl font-extrabold text-gray-600">
                      No match found :(
                    </div>
                  ) : (
                    <div className="w-full p-2">
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
                                  // className="w-full md:w-1/2 px-4 mb-6 bg-green-500"
                                  className="w-full md:w-1/2 px-4 mb-6"
                                >
                                  <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl">
                                    <div className="h-24 w-24">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/noImage.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
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
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            // GRID VIEW
                            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
                              {_default_collectables.map((item) => {
                                return (
                                  <div
                                    key={`${item.universeCollectableId}-default-search`}
                                  >
                                    {/* <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl bg-green-500"> */}
                                    <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                                      <div className="h-22 w-30">
                                        <img
                                          src={
                                            item.attributes?.find(
                                              (attr: any) =>
                                                attr.name === "image"
                                            )?.value || "/noImage.jpg"
                                          }
                                          alt={
                                            item.attributes?.find(
                                              (attr: any) =>
                                                attr.name === "Name"
                                            )?.value
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
                                                  attribute.slug ||
                                                  attribute.name
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
                                    </div>
                                  </div>
                                );
                              })}
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
                                  className="w-full md:w-1/2 px-4 mb-6"
                                >
                                  <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl">
                                    <div className="h-24 w-24">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/noImage.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
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
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            // GRID VIEW
                            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
                              {_searchResults.map((item, index) => (
                                <div
                                  key={
                                    `${item.universeCollectableId}-search` ||
                                    item.collectionId ||
                                    `item-${index}`
                                  }
                                >
                                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                                    <div className="h-22 w-30">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/noImage.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
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
                                  className={` ${
                                    item.universeCollectableId ===
                                      highlightedItemId ||
                                    item.collectableId ===
                                      ownedHighlightedItemId
                                      ? "border-4 border-yellow-500"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl">
                                    <div className="h-24 w-24">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/noImage.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
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
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            // GRID VIEW
                            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
                              {jumpSearchResults.map((item) => (
                                <div
                                  key={`${item.universeCollectableId}-jump`}
                                  className={` ${
                                    item.universeCollectableId ===
                                      highlightedItemId ||
                                    item.collectableId ===
                                      ownedHighlightedItemId
                                      ? "border-4 border-yellow-500"
                                      : ""
                                  }`}
                                >
                                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                                    <div className="h-22 w-30">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || "/noImage.jpg"
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
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
                        className="loading-indicator text-center p-1"
                      >
                        {isFetchingCollectables}
                      </div>
                      <div
                        ref={searchRef}
                        className="loading-indicator text-center p-1"
                      >
                        {isFetchingSearchResults}
                      </div>
                      <div
                        ref={jumpNextRef}
                        className="loading-indicator text-center p-1"
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
