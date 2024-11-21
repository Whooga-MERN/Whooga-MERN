import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import _, { add, set } from "lodash";

import { FaListUl, FaRegEdit } from "react-icons/fa";
import { BsFillGridFill } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoIosAdd } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegularStar } from "@fortawesome/free-regular-svg-icons";
import { IoMdClose } from "react-icons/io";

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
  fetchUniverseJumpResults,
  fetchOwnedJumpResults,
} from "../utils/ItemsPage";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import fetchJWT from "../fetchJWT";
import WishlistModal from "../Components/WishlistModal";

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
  const [isCollectionPublished, setIsCollectionPublished] = useState<boolean>();
  const [isModalOpen, setIsModalOpen] = useState(false); // new collectible
  const [showEdit, setShowEdit] = useState(false); // edit collectible
  const [view, setView] = useState<"list" | "grid">("grid");
  const [formData, setFormData] = useState<Record<string, any>>({ owned: "F" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  const [isOwnedMap, setIsOwnedMap] = useState<Map<string, boolean>>(new Map());
  const [publishedCollectableIds, setPublishedCollectableIds] = useState<
    string[]
  >([]);

  const [userId, setUserId] = useState<any>(null);
  const [JWT, setJWT] = useState<string>("");
  const { universeCollectionId } = useParams<{
    universeCollectionId: string;
  }>();
  const [collectionId, setCollectionId] = useState<string>();
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [maskedAttributes, setMaskedAttributes] = useState<string[]>([]);
  const [favoriteMaskedAttributes, setfavoriteMaskedAttributes] = useState<
    string[]
  >([]);
  const [collectionCoverImage, setCollectionCoverImage] = useState<string>("");
  const [customAttributes, setCustomAttributes] = useState<string[]>([]);
  const [favoriteAttributes, setFavoriteAttributes] = useState<string[]>([]);
  const [hiddenAttributes, setHiddenAttributes] = useState<string[]>([]);
  const [universeCollectionName, setUniverseCollectionName] = useState("");
  const [universeCollectables, setUniverseCollectables] = useState<any[]>([]);
  const [ownedCollectables, setOwnedCollectables] = useState<any[]>([]);
  const [openEditFavAttributesModal, setOpenEditFavAttributesModal] =
    useState(false);
  const [editedFavoriteAttributes, setEditedFavoriteAttributes] = useState<
    string[]
  >([]);

  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  const [wishlistIds, setWishlistIds] = useState<number[]>(() =>
    JSON.parse(localStorage.getItem("wishlistIds") || "[]")
  );

  const [noSearchResults, setNoSearchResults] = useState(false);
  const [noJumpResults, setNoJumpResults] = useState(false);

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  // Getting the collection id from local storage
  // Storing it in the state
  useEffect(() => {
    const collectionIDInStorage = localStorage.getItem("collectionId") ?? "";
    console.log("Collection ID in storage: ", collectionIDInStorage);
    setCollectionId(collectionIDInStorage);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("showSuccessAlert") === "true") {
      setShowSuccessAlert(true);
      localStorage.removeItem("showSuccessAlert");
    } else if (localStorage.getItem("showErrorAlert") === "true") {
      setShowErrorAlert(true);
      localStorage.removeItem("showErrorAlert");
    }

    const message = localStorage.getItem("alertMessage") ?? "";
    setAlertMessage(message);

    setTimeout(() => {
      setShowErrorAlert(false);
      setShowSuccessAlert(false);
    }, 4000);
  }, []);

  /**
   *  ======= FETCHING DATA =====
   *  Fetching Items from local storage
   *  Fetching User details and JWT
   *  Fetching Attributes
   *  Fetching Favorite Attributes
   */
  useEffect(() => {
    console.log("\n\n=========FETCHING ALL DATA========");
    if (!collectionId) {
      // console.log("Collection ID is undefined");
      return;
    } else if (!universeCollectionId) {
      // console.log("Universe Collection ID is undefined");
      return;
    }

    // Gather user data from local storage
    const getItemsFromStorage = async () => {
      console.log("\n\n=========Getting items from storage========");
      // Getting the collection name and collection ids from local storage
      const collectionName = localStorage.getItem("collectionName") ?? "";
      const collectionCover =
        localStorage.getItem("collectionCover") ?? "/noImage.jpg";
      const storedCollectionIds = localStorage.getItem("collectionIds") ?? "";
      const savedWishlist = localStorage.getItem("wishlistIds");

      // Setting the collection name, image and collection ids
      setUniverseCollectionName(collectionName);
      setCollectionCoverImage(collectionCover);
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
      console.log("========Fetching user details=======");
      try {
        const user = await fetchUserLoginDetails();
        setUserId(user || "");
      } catch (error) {
        console.error("Error Fetching User");
      }
    };
    fetchUserDetails();

    const fetchToken = async () => {
      console.log("========Fetching JWT=======");
      try {
        const token = await fetchJWT();
        setJWT(token || "");
      } catch (error) {
        console.error("Error fetching JWT");
      }
    };
    fetchToken();

    const getAttributes = async () => {
      console.log("\n\n==============Getting Masked attributes==============");
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
      console.log("\n\n=======Getting favorite attributes===========");
      console.log("Collection ID: ", collectionId);

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
        setFavoriteAttributes(data[0].favoriteAttributes);
        console.log("Favorite Attributes: ", data[0].favoriteAttributes);
        const allAttributes = data[0].favoriteAttributes.concat(
          maskedAttributes.filter(
            (attr) => !data[0].favoriteAttributes.includes(attr)
          )
        );
        setfavoriteMaskedAttributes(allAttributes);
      } else {
        console.error("Error fetching favorite attributes:", favReponse);
      }
    };

    getFavoriteAttributes();

    const getPublishedCollectables = async () => {
      const response = await fetch(
        buildPath(
          `universe-collectable/published-collectables/${universeCollectionId}`
        ),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        const publishedIds = data.map(
          (item: { collectableId: any }) => item.collectableId
        );
        setPublishedCollectableIds(publishedIds);
      } else {
        console.error("Error fetching published collectables:", response);
      }
    };
    getPublishedCollectables();

      const getisCollectionPublished = async () => {
      const response = await fetch(
        buildPath(`publish/is-collection-published/${universeCollectionId}`),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${JWT}`,
          },
        });
      if (response.ok) {
        const data = await response.json();
        setIsCollectionPublished(data[0].isPublished);
      } else {
        console.error("Error fetching isCollectionPublished:", response);
      }
    };
    getisCollectionPublished();
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
      initialFormData["owned"] = isOwnedMap.get(
        specificTag.universeCollectableId
      )
        ? "T"
        : "F";
      initialFormData["published"] = publishedCollectableIds.includes(
        specificTag.universeCollectableId
      )
        ? "T"
        : "F";

      setFormData(initialFormData); // Set the form data to the initial data for editing Modal

      const initialWishlistFormData = specificTag.attributes.reduce(
        (
          acc: { [x: string]: any },
          attr: { name: string | number; value: any }
        ) => {
          acc[attr.name] = {
            value: attr.value, // Store the original value
            checked: false, // Add a checked property initialized to false
          };
          return acc;
        },
        {} as Record<string, { value: any; checked: boolean }> // Ensure the correct type
      );

      setWishlistForm(initialWishlistFormData); // Set the wishlist form to the initial data for wishlisting Modal
    }
  }, [specificTag]);

  // -------------------------- show universecollectables and search ------------------
  useEffect(() => {
    const getOwnedCollectables = async () => {
      if (collectionId) {
        const ownedMap = new Map<string, boolean>();
        const ownedCollectables = await fetchOwnedCollectables(
          collectionId,
          initialPage,
          ITEMS_PER_PAGE,
          sortBy,
          sortOrder
        );
        //console.log("ownedCollectables", ownedCollectables);
        ownedCollectables.collectables.forEach((collectable: any) => {
          ownedMap.set(collectable.universeCollectableId, true);
        });
        //console.log("isOwnedMap0", ownedMap);
        setOwnedCollectables(ownedCollectables.collectables);
        if (universeCollectionId) {
          const universe_collectables = await fetchUniverseCollectables(
            universeCollectionId,
            initialPage,
            ITEMS_PER_PAGE,
            sortBy,
            sortOrder
          );
          universe_collectables.collectables.forEach((collectable: any) => {
            if (!ownedMap.has(collectable.universeCollectableId)) {
              ownedMap.set(collectable.universeCollectableId, false);
            }
          });
          setIsOwnedMap(ownedMap);
          setUniverseCollectables(universe_collectables.collectables);
        }
        //console.log("isOwnedMap1", isOwnedMap);
      }
    };

    getOwnedCollectables();
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
  const openEdit = async (
    item: Record<string, any>,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    console.log("\n\n\nOPEN EDIT");
    console.log("item data", item);

    const get_collectable_masked_data = async (item: Record<string, any>) => {
      const response = await fetch(
        buildPath(
          `collectable/masked-collectable/${item.universeCollectableId}`
        ),
        // buildPath(`universe-collectable/attributes/${item.universeCollectableId}`),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Error fetching specific tag:", response);
      }
    };

    const collectable_masked_data = await get_collectable_masked_data(item);

    const specificTag = {
      ...item,
      attributes: collectable_masked_data,
    };
   
    console.log("collectable_masked_data", collectable_masked_data);
    console.log("specificTag", specificTag);

    const imageAttribute = specificTag.attributes.find(
      (attr: { name: string }) => attr.name === "image"
    );

    if (imageAttribute && (!imageAttribute.value || imageAttribute.value === "")) {
      imageAttribute.value = collectionCoverImage;
      console.log("The image attribute was empty and has been set to collectionCoverImage.");
    } else {
      console.log("The image attribute has a value:", imageAttribute?.value);
    }


    await setSpecificTag(specificTag);
    // await setSpecificTag(item);
    setShowEdit(true);
  };

  const closeEdit = () => {
    console.log("SPECIFIC TAG:", specificTag);
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
          localStorage.setItem("showSuccessAlert", "true");
          localStorage.setItem(
            "alertMessage",
            "Deleted collectible successfully"
          );
        } else {
          console.error("Error deleting item:", response);
          localStorage.setItem("showErrorAlert", "true");
          localStorage.setItem("alertMessage", "Failed to delete collectible");
        }
        window.location.reload();
      } catch (error) {
        console.error("Error deleting item:", error);
        localStorage.setItem("showErrorAlert", "true");
        localStorage.setItem("alertMessage", "Failed to delete collectible");
        window.location.reload();
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

  useEffect(() => {
    // get wishlst items from localstorage
    const savedWishlist = localStorage.getItem("wishlistIds");
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        setWishlistIds(parsedWishlist);
      } catch (error) {
        console.error("Error parsing wishlist from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (wishlistIds.length > 0) {
      localStorage.setItem("wishlistIds", JSON.stringify(wishlistIds));
    }
  }, [wishlistIds]);

  const handleStarClick = (
    event: React.MouseEvent,
    item: Record<string, any>,
    universeCollectableId: number,
    collectionId?: string
  ) => {
    event.stopPropagation(); // Prevent event bubbling
    console.log("universeCollectableId", universeCollectableId);
    if (!collectionId) return;
    // check if in wishlist
    if (wishlistIds.includes(universeCollectableId)) {
      // Remove the item from the wishlist and change the star to regular
      setWishlistIds((prev) =>
        prev.filter((id) => id !== universeCollectableId)
      );
      removeFromWishlist(collectionId, universeCollectableId);
    } else {
      // Open up the Wishlist Modal to add the item to the wishlist
      console.log("OPENINGGGGGG");
      setWishlistModal(true);
      setSpecificTag(item);
      setWishlistModal_UCollectableID(universeCollectableId);
    }
  };

  //----------------Wishlist Modal Handling-------------------

  const [wishlistModal, setWishlistModal] = useState(false);
  const [wishlistModal_UCollectableID, setWishlistModal_UCollectableID] =
    useState<number | null>(null);
  const [wishlistForm, setWishlistForm] = useState<Record<string, any>>({});

  const submitWishlistRequest = () => {
    // RUN CODE TO SUBMIT WISHLIST REQUEST
    if (universeCollectionId && wishlistModal_UCollectableID) {
      // Create a search string from checked attributes
      const searchString = Object.entries(wishlistForm)
        .filter(([_, obj]) => obj.checked) // Include only entries where checked is true
        .map(([_, obj]) => obj.value) // Extract the value property
        .join(" "); // Join the values into a space-separated string

      console.log("searchString:", searchString);

      addToWishlist(
        universeCollectionId,
        wishlistModal_UCollectableID,
        searchString
      );

      setWishlistIds((prev) => [...prev, wishlistModal_UCollectableID]);
    } else {
      console.error("universeCollectionId is null");
    }

    setWishlistModal(false);
    setSpecificTag(null);
    setWishlistModal_UCollectableID(null);
  };

  const starClickClose = () => {
    // Cancel the wishlist request

    setWishlistForm({});
    setWishlistModal(false);
    setSpecificTag(null);
    setWishlistModal_UCollectableID(null);
  };

  const handleWishlistFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    // Log the change for debugging
    console.log(`${name} is now ${checked}`);

    // Update the wishlistForm state
    setWishlistForm((prev) => ({
      ...prev, // Keep all other attributes
      [name]: {
        ...prev[name], // Preserve the existing value property
        checked: checked, // Update only the checked property
      },
    }));
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

  const handlePublishChangeEditCollectable = (published: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      ["published"]: published ? "T" : "F",
    }));
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
        localStorage.setItem("showSuccessAlert", "true");
        localStorage.setItem(
          "alertMessage",
          "Added new collectible successfully"
        );
      } else {
        console.error("Error submitting form:", response);
        localStorage.setItem("showErrorAlert", "true");
        localStorage.setItem("alertMessage", "Failed to add new collectible");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      localStorage.setItem("showErrorAlert", "true");
      localStorage.setItem("alertMessage", "Failed to add new collectible");
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
    const { owned, image, published, ...restFormData } = formData;
    console.log("owned", owned);
    console.log("published", published);
    request.append("attributeValuesJson", JSON.stringify(restFormData));
    if (published) {
      request.append("isPublished", published);
    } else {
      request.append("isPublished", "F");
    }
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
        localStorage.setItem("showSuccessAlert", "true");
        localStorage.setItem("alertMessage", "Collectible edited successfully");
      } else {
        console.error("Error submitting form:", response);
        localStorage.setItem("showErrorAlert", "true");
        localStorage.setItem("alertMessage", "Failed to edit collectible");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      localStorage.setItem("showErrorAlert", "true");
      localStorage.setItem("alertMessage", "Failed to edit collectible");
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
  const handleOpenModal = async (
    item: Record<string, any>,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    console.log("\n\n\nOPEN EDIT");
    console.log("item data", item);

    event.stopPropagation(); // Prevent event bubbling

    const get_collectable_masked_data = async (item: Record<string, any>) => {
      const response = await fetch(
        buildPath(
          `collectable/masked-collectable/${item.universeCollectableId}`
        ),
        // buildPath(`universe-collectable/attributes/${item.universeCollectableId}`),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Error fetching specific tag:", response);
      }
    };

    const collectable_masked_data = await get_collectable_masked_data(item);

    const specificTag = {
      ...item,
      attributes: collectable_masked_data,
    };

    console.log("collectable_masked_data", collectable_masked_data);
    console.log("specificTag", specificTag);

    await setSpecificTag(specificTag);

    // setSpecificTag(item);
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

  const handleToggleChange = (enabled: boolean) => {
    setEnabled(enabled);
    handleClearSearch();
    setCurrentPage(1);
    setJumpSearchResults([]);
    setSearchResults([]);
    setJumped(false); // Reset `jumped` to false, this is for adjusting scroll position when items are added while scrolling up. When `jumped` is true, the initial jump has occurred
    setPrevHeight(0); // Reset the previous height, this is for adjusting scroll position when items are added while scrolling up

    // Add visual feedback
    setAlertMessage(enabled ? "Showing owned items only" : "Showing all items");
    setShowSuccessAlert(true);
    
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 2000);
  };

  // -------------------------- show universecollectables and search ------------------
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [sortBy, setSortBy] = useState<string>("");

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
    fetchCollectablesNextPage();
  };

  const handleSortByChange = (attribute: string) => {
    setSortBy(attribute);
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
      if (enabled && collectionId) {
        // Fetch owned collectables when enabled
        const { collectables, totalMatchingCollectables } =
          await fetchOwnedCollectables(
            collectionId,
            pageParam,
            ITEMS_PER_PAGE,
            sortBy,
            sortOrder
          );
        return { collectables, totalMatchingCollectables };
      } else if (universeCollectionId) {
        // Fetch universe collectables when not enabled
        const { collectables, totalMatchingCollectables } =
          await fetchUniverseCollectables(
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
          await fetchUniverseSearchResults(
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
    setNoSearchResults(false);

    // Set jump-related state
    setJumpSearchTags(jumpTags);
    setJumpSearchResults([]);
    setLoadedPages(new Set());
    setNoJumpResults(false);

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
          setHighlightedItemId(res.universe_collectable_id);
        }
      } else if (universeCollectionId) {
        // Fetch universe jump results when toggle is disabled
        res = await fetchUniverseJumpResults(
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

      console.log(res);
      if (!res || Object.keys(res).length === 0) {
        // If res is null, undefined, or empty, set noJumpResults to true
        setNoJumpResults(true);
        return;
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
          console.log(data);
          if (data.collectables.length === 0) {
            setNoJumpResults(true);
          } else {
            setJumpSearchResults(data.collectables);
            setLoadedPages(new Set([res.pageNumber]));
            setNoJumpResults(false);
          }
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

  // ------------------------- Add/Delete Attributes -------------------------

  const [editedAttributes, setEditedAttributes] = useState<string[]>([]);
  const [openEditAttributesModal, setOpenEditAttributesModal] = useState(false);
  const [isAttributeEmpty, setIsAttributesEmpty] = useState(false);

  const openEditAttributes = () => {
    setEditedAttributes(maskedAttributes);
    console.log("Edited Favorite Attributes: ", editedAttributes);
    console.log("maskedAttributes: ", maskedAttributes);
    setOpenEditAttributesModal(true);
  };

  const closeEditAttributes = () => {
    setIsAttributesEmpty(false);
    setOpenEditAttributesModal(false);
  };

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const newFeature = (event.target as HTMLInputElement).value.trim();
      if (newFeature === "") {
        return;
      }
      setEditedAttributes([...editedAttributes, newFeature]);
      setIsAttributesEmpty(false);
      (event.target as HTMLInputElement).value = "";
    }
  };

  const deleteAttribute = (tagToDelete: string) => {
    const index = editedAttributes.findIndex((tag) => tag === tagToDelete);
    if (index !== -1) {
      setEditedAttributes([
        ...editedAttributes.slice(0, index),
        ...editedAttributes.slice(index + 1),
      ]);
    }
  };

  function splitChanges(original: string[], updated: string[]) {
    const removed = original.filter((item) => !updated.includes(item));
    const added = updated.filter((item) => !original.includes(item));

    return { removed, added };
  }

  const handleEditAttributesSubmit = async () => {
    if (editedAttributes.length === 0) {
      setIsAttributesEmpty(true);
      return;
    }

    const { removed, added } = splitChanges(maskedAttributes, editedAttributes);

    console.log("Masked Attributes: ", maskedAttributes);
    console.log("Edited Attributes: ", editedAttributes);
    console.log("Removed: ", removed);
    console.log("Added: ", added);

    // Remove any attributes
    if (removed.length !== 0) {
      const request_hide = {
        collectionUniverseId: universeCollectionId,
        attributes: removed,
      };

      try {
        const response = await fetch(
          buildPath(`collectable-attributes/add-hidden-attribute`),
          {
            method: "PUT",
            body: JSON.stringify(request_hide),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT}`,
            },
          }
        );

        if (response.ok) {
          console.log("hidden attributes edited successfully");
          await setMaskedAttributes(editedAttributes);
          closeEditAttributes();
        } else {
          console.error("Error editing hidden attributes:", response);
          closeEditAttributes();
        }
      } catch (error) {
        console.error("Error editing hidden attributes:", error);
        closeEditAttributes();
      }
    }

    // Adding new custom attributes
    if (added.length !== 0) {
      const request_add = {
        collectionUniverseId: universeCollectionId,
        customAttributes: added,
      };

      try {
        const response = await fetch(
          buildPath(`collectable-attributes/add-custom-attributes`),
          {
            method: "PUT",
            body: JSON.stringify(request_add),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT}`,
            },
          }
        );

        if (response.ok) {
          console.log("Custom Attributes edited successfully");
          await setMaskedAttributes(editedAttributes);
          closeEditAttributes();
          localStorage.setItem("showSuccessAlert", "true");
          localStorage.setItem(
            "alertMessage",
            "Attributes edited successfully"
          );
        } else {
          console.error("Error editing Custom attributes:", response);
          closeEditAttributes();
          localStorage.setItem("showErrorAlert", "true");
          localStorage.setItem("alertMessage", "Failed to edit attributes");
        }
      } catch (error) {
        console.error("Error editing Custom attributes:", error);
        closeEditAttributes();
        localStorage.setItem("showErrorAlert", "true");
        localStorage.setItem("alertMessage", "Failed to edit attributes");
      }
    }
  };

  // ------------------------- Edit Favorite Attributes -------------------------

  const openEditFavoriteAttributes = () => {
    setEditedFavoriteAttributes(favoriteAttributes);
    console.log("Edited Favorite Attributes: ", editedFavoriteAttributes);
    console.log("maskedAttributes: ", maskedAttributes);
    console.log("collectionId: ", collectionId);
    setOpenEditFavAttributesModal(true);
  };

  const closeEditFavoriteAttributes = () => {
    setOpenEditFavAttributesModal(false);
  };

  const handleFavAttributeChange = (checked: boolean, attribute: string) => {
    if (checked) {
      setEditedFavoriteAttributes((prev) => [...prev, attribute]);
    } else {
      setEditedFavoriteAttributes((prev) =>
        prev.filter((attr) => attr !== attribute)
      );
    }
    console.log("Favorite Attributes: ", editedFavoriteAttributes);
  };

  const handleEditFavAttributesSubmit = async () => {
    const request = {
      collectionId: collectionId,
      favoriteAttributes: editedFavoriteAttributes,
    };

    try {
      console.log("Request to change favs:  ", request);
      const response = await fetch(
        buildPath(`collectable-attributes/update-favorite-attributes`),
        {
          method: "PUT",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT}`,
          },
        }
      );

      if (response.ok) {
        console.log("Favorite Attributes edited successfully");
        setFavoriteAttributes(editedFavoriteAttributes);
        const allAttributes = editedFavoriteAttributes.concat(
          maskedAttributes.filter(
            (attr) => !editedFavoriteAttributes.includes(attr)
          )
        );
        await setMaskedAttributes(allAttributes);
        closeEditAttributes();
        localStorage.setItem("showSuccessAlert", "true");
        localStorage.setItem(
          "alertMessage",
          "Favorite attributes edited successfully"
        );
        //window.location.reload();
      } else {
        console.error("Error editing favorite attributes 1#:", response);
        localStorage.setItem("showErrorAlert", "true");
        localStorage.setItem(
          "alertMessage",
          "Failed to edit favorite attributes"
        );
      }
    } catch (error) {
      if (error == "TypeError: Failed to fetch") {
        console.error("This is a weird PUT error:", error);
        return;
      }
      console.error("Error editing favorite attributes 2#:", error);
      localStorage.setItem("showErrorAlert", "true");
      localStorage.setItem(
        "alertMessage",
        "Failed to edit favorite attributes"
      );
    }
  };

const publishCollection = async () => {
  const confirmMessage = isCollectionPublished ? "Are you sure you want to unpublish this collection?" 
    : "Are you sure you want to publish this collection?";
  if (confirm(confirmMessage)) {
    const request = {
      collectionUniverseId: universeCollectionId,
      isPublished: isCollectionPublished ? "false" : "true",
    };
    console.log("Request: ", request);
    try {
      const response = await fetch(
        buildPath('publish/publish-universe'),
        {
          method: "PUT",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT}`,
          },
        }
      );
      if (response.ok) {
        console.log("Collection published successfully");
        localStorage.setItem("showSuccessAlert", "true");
        localStorage.setItem("alertMessage", `Successfully ${isCollectionPublished ? "un" : ""}published collection`);
        //window.location.reload();
      } else {
        console.error("Error publishing collection:", response);
        localStorage.setItem("showErrorAlert", "true");
        localStorage.setItem("alertMessage", `Failed to ${isCollectionPublished ? "un" : ""}publish collection`);
        //window.location.reload();
      }
    } catch (error) {
      console.error("Error publishing collection:", error);
      localStorage.setItem("showErrorAlert", "true");
      localStorage.setItem("alertMessage", `Failed to ${isCollectionPublished ? "un" : ""}publish collection`);
      //window.location.reload();
    }
  }
  };

  return (
    <>
      <div className="h-screen flex flex-col overflow-y-hidden">
        <div className="top-0 z-50 bg-white dark:bg-gray-800 w-full">
          <Header />
          <div className="toast toast-top toast-center">
            <div
              role="alert"
              className={`alert ${
                showErrorAlert ? "alert-error" : "alert-success"
              }  ${
                showSuccessAlert || showErrorAlert ? "" : "invisible"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={`${
                    showSuccessAlert
                      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  }`}
                />
              </svg>
              <span className="ml-2">{alertMessage}</span>
            </div>
          </div>
          <div className="w-full mx-auto">
            <div className="mx-auto px-10 dark:bg-gray-800">
              {/* flex md:items-center gap-28 pb-4 max-md:px-4 w-fit */}
              <div className="">
                {/* collection option */}
                <div className="flex items-center gap-4 dark:bg-gray-800 mt-4">
                  <p className="font-bold text-xl w-fit text-black bg-yellow-300 rounded-full px-4 py-3 ">
                    {universeCollectionName}
                  </p>
                  <OwnedToggle
                    enabled={enabled}
                    setEnabled={setEnabled}
                    onToggle={handleToggleChange}
                  />
                  <div className="flex lg:hidden items-center">
                    {isCollectionOwned ? (
                      <div className="dropdown">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn text-xl text-black bg-yellow-300 hover:bg-yellow-200 rounded-xl w-fit"
                        >
                          <MdEdit />
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
                              New Collectible
                            </a>
                          </li>
                          <li>
                            <a
                              className="text-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                              onClick={openEditAttributes}
                            >
                              Edit Favorite Attributes
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
                                Publish Collectible
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

                <div className="flex items-center justify-center gap-32">
                  {/* Search bar */}
                  {universeCollectionId && (
                    <SearchBar
                      attributes={favoriteAttributes}
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
                          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-60 p-2 shadow"
                        >
                          <li>
                            <a
                              className="text-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                              onClick={openModal}
                            >
                              New Collectible
                            </a>
                          </li>
                          <li>
                            <a
                              className="text-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                              onClick={openEditAttributes}
                            >
                              Add/Remove Attributes
                            </a>
                          </li>
                          <li>
                            <a
                              className="text-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                              onClick={openEditFavoriteAttributes}
                            >
                              Edit Favorite Attributes
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
                              className="text-lg hover:bg-gray-200 hover:text-black"
                              onClick={publishCollection}
                            >
                              {isCollectionPublished ? "Unpublish Collection" : "Publish Collection"}
                            </a>
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
                                Publish Collectible
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
        </div>

        <div className="w-full px-10 py-2 flex justify-end dark:bg-gray-800">
          {searchTags.length > 0 &&
          searchResultsData?.pages?.[0]?.totalMatchingCollectables ? (
            // if there is searchResults, show total count
            <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
              Total Matching Search Results:{" "}
              {searchResultsData.pages[0].totalMatchingCollectables}
            </p>
          ) : (
            // Show total collectables
            collectablesData?.pages?.[0]?.totalMatchingCollectables && (
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
                Total Collectibles:{" "}
                {collectablesData.pages[0].totalMatchingCollectables}
              </p>
            )
          )}
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

                  {noSearchResults || noJumpResults ? (
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
                                  className="w-full md:w-1/2 px-4 mb-6 cursor-pointer"
                                >
                                  <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl cursor-pointer bg-gray-50 border-2 border-gray-200">
                                    <button
                                      className="text-3xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                                      onClick={(event) => {
                                        event.stopPropagation(); // Prevent event bubbling
                                        handleStarClick(
                                          event,
                                          item,
                                          item.universeCollectableId,
                                          collectionId
                                        );
                                      }}
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
                                    <div className="h-24 w-24 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || collectionCoverImage
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
                                          )?.value || "No Name"
                                        }
                                        className="max-h-full max-w-full object-cover"
                                        onClick={(e) =>
                                          handleOpenModal(item, e)
                                        }
                                      />
                                    </div>

                                    <div
                                      className="flex-1"
                                      onClick={(e) => handleOpenModal(item, e)}
                                    >
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
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent event from bubbling to the parent <div>
                                          openEdit(item, e);
                                        }}
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
                            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
                              {_default_collectables.map((item) => (
                                <div
                                  key={`${item.universeCollectableId}-default-search`}
                                  className="relative cursor-pointer bg-gray-50 border-2 border-gray-200 hover:shadow-xl dark:bg-base-300 rounded-xl h-auto"
                                >
                                  <div className="h-22 w-30 relative">
                                    {/* Star Button */}
                                    <button
                                      className="absolute top-2 right-2 flex items-center justify-center text-3xl font-extrabold w-10 h-10 text-[#7b4106] bg-white hover:text-yellow-600 hover:shadow-md z-10 rounded-full border border-red-50"
                                      onClick={(event) => {
                                        event.stopPropagation(); // Prevent event bubbling
                                        handleStarClick(
                                          event,
                                          item,
                                          item.universeCollectableId,
                                          collectionId
                                        );
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={
                                          wishlistIds.includes(
                                            item.universeCollectableId
                                          )
                                            ? faSolidStar
                                            : faRegularStar
                                        }
                                        style={{ color: "#EDC307" }}
                                      />
                                    </button>

                                    {/* Image */}
                                    <div className="h-64 w-full relative bg-gray-100 rounded-md pt-3 flex items-center justify-center overflow-hidden">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || collectionCoverImage
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
                                          )?.value || "No Name"
                                        }
                                        className="max-h-full max-w-full object-cover"
                                        onClick={(e) =>
                                          handleOpenModal(item, e)
                                        }
                                      />
                                    </div>
                                  </div>

                                  {/* Attributes Section */}
                                  <div
                                    className="space-y-1 p-5 overflow-visible"
                                    onClick={(e) => handleOpenModal(item, e)}
                                  >
                                    {item.attributes
                                      .filter(
                                        (attribute: any) =>
                                          attribute.name !== "image" &&
                                          attribute.name !== "owned"
                                      )
                                      .slice(0, 3)
                                      .map((attribute: any, index: number) => (
                                        <div
                                          key={`${
                                            attribute.slug || attribute.name
                                          }-default-search`}
                                          className="group relative"
                                        >
                                          <p
                                            className={
                                              index === 0
                                                ? "mt-4 text-lg font-bold pl-4 uppercase text-ellipsis overflow-hidden line-clamp-2"
                                                : "text-md font-semibold pl-4 capitalize truncate"
                                            }
                                          >
                                            {`${attribute.value}`}
                                          </p>
                                          <span
                                            className="absolute bottom-full left-0 w-auto p-2 mb-2 text-md text-black bg-yellow-300 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                            style={{
                                              transform: "translateX(-20px)",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {`${attribute.value}`}
                                          </span>
                                        </div>
                                      ))}

                                    <div className="flex justify-center items-center space-x-4 pt-3 pb-2">
                                      <button
                                        className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full flex items-center justify-center"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent event from bubbling to the parent <div>
                                          openEdit(item, e);
                                        }}
                                      >
                                        <FaRegEdit />
                                      </button>
                                      <button
                                        className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full flex items-center justify-center"
                                        onClick={() => handleDelete(item)}
                                      >
                                        <FaRegTrashCan />
                                      </button>
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
                                  className="w-full md:w-1/2 px-4 mb-6 cursor-pointer"
                                >
                                  <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl cursor-pointer bg-gray-50 border-2 border-gray-200">
                                    <button
                                      className="text-3xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                                      onClick={(event) => {
                                        event.stopPropagation(); // Prevent event bubbling
                                        handleStarClick(
                                          event,
                                          item,
                                          item.universeCollectableId,
                                          collectionId
                                        );
                                      }}
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
                                    <div className="h-24 w-24 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || collectionCoverImage
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
                                          )?.value || "No Name"
                                        }
                                        className="max-h-full max-w-full object-cover"
                                        onClick={(e) =>
                                          handleOpenModal(item, e)
                                        }
                                      />
                                    </div>

                                    <div
                                      className="flex-1"
                                      onClick={(e) => handleOpenModal(item, e)}
                                    >
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
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent event from bubbling to the parent <div>
                                          openEdit(item, e);
                                        }}
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
                            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
                              {_searchResults.map((item) => (
                                <div
                                  key={`${item.universeCollectableId}-search`}
                                  className="relative cursor-pointer bg-gray-50 border-2 border-gray-200 hover:shadow-xl dark:bg-base-300 rounded-xl h-auto"
                                >
                                  <div className="h-22 w-30 relative">
                                    {/* Star Button */}
                                    <button
                                      className="absolute top-2 right-2 flex items-center justify-center text-3xl font-extrabold w-10 h-10 text-[#7b4106] bg-white hover:text-yellow-600 hover:shadow-md z-10 rounded-full border border-red-50"
                                      onClick={(event) => {
                                        event.stopPropagation(); // Prevent event bubbling
                                        handleStarClick(
                                          event,
                                          item,
                                          item.universeCollectableId,
                                          collectionId
                                        );
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={
                                          wishlistIds.includes(
                                            item.universeCollectableId
                                          )
                                            ? faSolidStar
                                            : faRegularStar
                                        }
                                        style={{ color: "#EDC307" }}
                                      />
                                    </button>

                                    {/* Image */}
                                    <div className="h-64 w-full relative bg-gray-100 rounded-md pt-3 flex items-center justify-center overflow-hidden">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || collectionCoverImage
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
                                          )?.value || "No Name"
                                        }
                                        className="max-h-full max-w-full object-cover"
                                        onClick={(e) =>
                                          handleOpenModal(item, e)
                                        }
                                      />
                                    </div>
                                  </div>

                                  {/* Attributes Section */}
                                  <div
                                    className="space-y-1 p-5 overflow-visible"
                                    onClick={(e) => handleOpenModal(item, e)}
                                  >
                                    {item.attributes
                                      .filter(
                                        (attribute: any) =>
                                          attribute.name !== "image" &&
                                          attribute.name !== "owned"
                                      )
                                      .slice(0, 3)
                                      .map((attribute: any, index: number) => (
                                        <div
                                          key={`${
                                            attribute.slug || attribute.name
                                          }-default-search`}
                                          className="group relative"
                                        >
                                          <p
                                            className={
                                              index === 0
                                                ? "mt-4 text-lg font-bold pl-4 uppercase text-ellipsis overflow-hidden line-clamp-2"
                                                : "text-md font-semibold pl-4 capitalize truncate"
                                            }
                                          >
                                            {`${attribute.value}`}
                                          </p>
                                          <span
                                            className="absolute bottom-full left-0 w-auto p-2 mb-2 text-md text-black bg-yellow-300 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                            style={{
                                              transform: "translateX(-20px)",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {`${attribute.value}`}
                                          </span>
                                        </div>
                                      ))}

                                    <div className="flex justify-center items-center space-x-4 pt-3 pb-2">
                                      <button
                                        className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full flex items-center justify-center"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent event from bubbling to the parent <div>
                                          openEdit(item, e);
                                        }}
                                      >
                                        <FaRegEdit />
                                      </button>
                                      <button
                                        className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full flex items-center justify-center"
                                        onClick={() => handleDelete(item)}
                                      >
                                        <FaRegTrashCan />
                                      </button>
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
                                  className={`w-full md:w-1/2 px-4 mb-6 cursor-pointer ${
                                    item.universeCollectableId ===
                                    highlightedItemId
                                      ? "border-4 border-yellow-500"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl cursor-pointer bg-gray-50 border-2 border-gray-200">
                                    <button
                                      className="text-3xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                                      onClick={(event) => {
                                        event.stopPropagation(); // Prevent event bubbling
                                        handleStarClick(
                                          event,
                                          item,
                                          item.universeCollectableId,
                                          collectionId
                                        );
                                      }}
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
                                    <div className="h-24 w-24 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || collectionCoverImage
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
                                          )?.value || "No Name"
                                        }
                                        className="max-h-full max-w-full object-cover"
                                        onClick={(e) =>
                                          handleOpenModal(item, e)
                                        }
                                      />
                                    </div>

                                    <div
                                      className="flex-1"
                                      onClick={(e) => handleOpenModal(item, e)}
                                    >
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
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent event from bubbling to the parent <div>
                                          openEdit(item, e);
                                        }}
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
                            <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
                              {jumpSearchResults.map((item) => (
                                <div
                                  key={`${item.universeCollectableId}-jump`}
                                  className={`relative cursor-pointer bg-gray-50 border-2 border-gray-200 hover:shadow-xl dark:bg-base-300 rounded-xl h-auto ${
                                    item.universeCollectableId ===
                                    highlightedItemId
                                      ? "border-4 border-yellow-500"
                                      : ""
                                  }`}
                                >
                                  <div className="h-22 w-30 relative">
                                    {/* Star Button */}
                                    <button
                                      className="absolute top-2 right-2 flex items-center justify-center text-3xl font-extrabold w-10 h-10 text-[#7b4106] bg-white hover:text-yellow-600 hover:shadow-md z-10 rounded-full border border-red-50"
                                      onClick={(event) => {
                                        event.stopPropagation(); // Prevent event bubbling
                                        handleStarClick(
                                          event,
                                          item,
                                          item.universeCollectableId,
                                          collectionId
                                        );
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={
                                          wishlistIds.includes(
                                            item.universeCollectableId
                                          )
                                            ? faSolidStar
                                            : faRegularStar
                                        }
                                        style={{ color: "#EDC307" }}
                                      />
                                    </button>

                                    {/* Image */}
                                    <div className="h-64 w-full relative bg-gray-100 rounded-md pt-3 flex items-center justify-center overflow-hidden">
                                      <img
                                        src={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "image"
                                          )?.value || collectionCoverImage
                                        }
                                        alt={
                                          item.attributes?.find(
                                            (attr: any) => attr.name === "Name"
                                          )?.value || "No Name"
                                        }
                                        className="max-h-full max-w-full object-cover"
                                        onClick={(e) =>
                                          handleOpenModal(item, e)
                                        }
                                      />
                                    </div>
                                  </div>

                                  {/* Attributes Section */}
                                  <div
                                    className="space-y-1 p-5 overflow-visible"
                                    onClick={(e) => handleOpenModal(item, e)}
                                  >
                                    {item.attributes
                                      .filter(
                                        (attribute: any) =>
                                          attribute.name !== "image" &&
                                          attribute.name !== "owned"
                                      )
                                      .slice(0, 3)
                                      .map((attribute: any, index: number) => (
                                        <div
                                          key={`${
                                            attribute.slug || attribute.name
                                          }-default-search`}
                                          className="group relative"
                                        >
                                          <p
                                            className={
                                              index === 0
                                                ? "mt-4 text-lg font-bold pl-4 uppercase text-ellipsis overflow-hidden line-clamp-2"
                                                : "text-md font-semibold pl-4 capitalize truncate"
                                            }
                                          >
                                            {`${attribute.value}`}
                                          </p>
                                          <span
                                            className="absolute bottom-full left-0 w-auto p-2 mb-2 text-md text-black bg-yellow-300 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                            style={{
                                              transform: "translateX(-20px)",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {`${attribute.value}`}
                                          </span>
                                        </div>
                                      ))}

                                    <div className="flex justify-center items-center space-x-4 pt-3 pb-2">
                                      <button
                                        className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full flex items-center justify-center"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent event from bubbling to the parent <div>
                                          openEdit(item, e);
                                        }}
                                      >
                                        <FaRegEdit />
                                      </button>
                                      <button
                                        className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full flex items-center justify-center"
                                        onClick={() => handleDelete(item)}
                                      >
                                        <FaRegTrashCan />
                                      </button>
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

                  {wishlistModal && specificTag && (
                    <WishlistModal
                      handleWishlistFormChange={handleWishlistFormChange}
                      maskedAttributes={maskedAttributes}
                      wishlistForm={wishlistForm}
                      submitWishlistRequest={submitWishlistRequest}
                      itemData={specificTag}
                      onClose={starClickClose}
                      isVisible={wishlistModal}
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
                                        checked={
                                          formData["owned"] === "T" || false
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
                              checked={formData["published"] === "T" || false}
                              onChange={(e) =>
                                handlePublishChangeEditCollectable(
                                  e.target.checked
                                )
                              }
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

                  {/* Edit Favorite Attributes Modal */}
                  {openEditFavAttributesModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:w-3/4 lg:w-[480px] max-h-screen overflow-y-auto mt-20">
                        <h2 className="text-xl font-bold mb-4 dark:text-gray-300">
                          Edit Favorite Attributes
                        </h2>

                        <form onSubmit={handleEditFavAttributesSubmit}>
                          {maskedAttributes.map((attribute, index) => (
                            <div
                              key={`${attribute}-${index}`}
                              className="flex items-center mb-3"
                            >
                              <input
                                type="checkbox"
                                id={attribute}
                                checked={editedFavoriteAttributes.includes(
                                  attribute
                                )}
                                onChange={(e) =>
                                  handleFavAttributeChange(
                                    e.target.checked,
                                    attribute
                                  )
                                }
                                className="h-5 w-5 text-primary border-gray-300 rounded mb-2 mr-2"
                              />
                              <label
                                htmlFor="publishCollection"
                                className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                              >
                                {attribute}
                              </label>
                            </div>
                          ))}

                          <div className="flex justify-end space-x-4 mt-8">
                            <button
                              type="button"
                              onClick={closeEditFavoriteAttributes}
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

                  {/* Add and Remove Attributes Modal */}
                  {openEditAttributesModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:w-3/4 lg:w-[480px] max-h-screen overflow-y-auto mt-20">
                        <h2 className="text-xl font-bold mb-4 dark:text-gray-300">
                          Add or Remove Attributes
                        </h2>

                        <h1 className="text text-red-500">
                          <span className="text-lg">*Warning*</span>: Saving
                          changes will affect this Collection
                        </h1>

                        <p className="text-red-500 text-md">
                          {isAttributeEmpty
                            ? "* Please save at least one item attribute *"
                            : ""}
                        </p>

                        {/* Features */}
                        <div className="flex flex-col justify-center mt-4">
                          <input
                            type="text"
                            onKeyDown={handleEnterPress}
                            placeholder="Press Enter to add"
                            id="collectionName"
                            autoComplete="off"
                            className="w-full h-12 mt-2 border-2 text-black rounded-md px-4"
                          />
                        </div>
                        <div className="flex flex-wrap mt-2">
                          {editedAttributes.map((attribute, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-black dark:text-white-600 text-gray-200 font-semibold text-lg rounded-md pl-4 pr-2 py-1 mr-3 mt-2"
                            >
                              {attribute}
                              <button
                                className="pl-4 text-red-500 "
                                onClick={() => deleteAttribute(attribute)}
                              >
                                <IoMdClose />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end space-x-4 mt-8">
                          <button
                            type="button"
                            onClick={closeEditAttributes}
                            className="bg-gray-300 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleEditAttributesSubmit}
                            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-xl"
                          >
                            Save Changes
                          </button>
                        </div>
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
