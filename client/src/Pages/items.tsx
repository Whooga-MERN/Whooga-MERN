import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import _, { debounce, set } from "lodash";
import {
  FaListUl,
  FaRegEdit,
  FaSortAmountDown,
  FaFilter,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { BsFillGridFill } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoIosAdd } from "react-icons/io";
import { PhotoIcon } from "@heroicons/react/24/solid";
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/20/solid";

import Header from "../Components/Header";
import Modal from "../Components/Modal";
import Footer from "../Components/Footer";
import SearchBar from "../Components/searchBar";
import { buildPath } from "../utils/utils";
import { fetchSearchResults } from "../utils/fetchSearchResults";
import fetchUserLoginDetails from "../fetchUserLoginDetails";

const ITEMS_PER_PAGE = 24;

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

const tags = [
  {
    id: 1,
    title: "eagle",
    image: "/eagle.jpg",
    createAt: "03/12/24",
    tagNum: "#55988",
    createdBy: "This person",
    color: ["purple", "blue", "grey"],
  },
  {
    id: 2,
    title: "psycho",
    image: "/psycho.jpg",
    createAt: "3/06/24",
    tagNum: "#55927",
    createdBy: "That person",
    color: ["red", "black", "white"],
  },
  {
    id: 3,
    title: "shawshank",
    image: "/shawshank.jpg",
    createAt: "02/28/24",
    tagNum: "#55881",
    createdBy: "Those person",
    color: ["brown", "black", "orange"],
  },
  {
    id: 4,
    title: "golddog",
    image: "/golddog.jpg",
    createAt: "03/04/24",
    tagNum: "#55915",
    createdBy: "This group",
    color: ["yellow", "purple", "pink"],
  },
  {
    id: 5,
    title: "Bear",
    image: "/bear.jpg",
    createAt: "03/12/24",
    tagNum: "#55996",
    createdBy: "That group",
    color: ["red", "brown", "black"],
  },
  {
    id: 6,
    title: "Ghostbusters",
    image: "/ghostbusters.jpg",
    createAt: "02/03/24",
    tagNum: "#55697",
    createdBy: "Those groups",
    color: ["red", "green", "white"],
  },
  {
    id: 7,
    title: "braveheart",
    image: "/braveheart.jpg",
    createAt: "03/12/24",
    tagNum: "#55994",
    createdBy: "me",
    color: ["blue", "black", "white"],
  },
  {
    id: 8,
    title: "tiny toon",
    image: "/tinytoon.jpg",
    createAt: "03/07/24",
    tagNum: "#55958",
    createdBy: "He",
    color: ["red", "yellow", "purple", "blue"],
  },
  {
    id: 9,
    title: "alien invasion club",
    image: "/alienclub.jpg",
    createAt: "03/06/24",
    tagNum: "#55949",
    createdBy: "She",
    color: ["green", "yellow", "red"],
  },
  {
    id: 10,
    title: "lisboa portugal train 28",
    image: "/lisboaportugal28.jpg",
    createAt: "03/05/24",
    tagNum: "#55917",
    createdBy: "Them",
    color: ["brown", "blue", "yellow"],
  },
  {
    id: 11,
    title: "galactic wars",
    image: "/galacticwars.jpg",
    createAt: "03/15/24",
    tagNum: "#55928",
    createdBy: "A Rebel",
    color: ["black", "grey", "red"],
  },
  {
    id: 12,
    title: "mountain explorer",
    image: "/mountainexplorer.jpg",
    createAt: "03/18/24",
    tagNum: "#55935",
    createdBy: "Adventurer",
    color: ["green", "blue", "brown"],
  },
  {
    id: 13,
    title: "sunset paradise",
    image: "/sunsetparadise.jpg",
    createAt: "03/20/24",
    tagNum: "#55945",
    createdBy: "Nature Lover",
    color: ["orange", "yellow", "pink"],
  },
  {
    id: 14,
    title: "ocean depths",
    image: "/oceandepths.jpg",
    createAt: "03/22/24",
    tagNum: "#55955",
    createdBy: "Deep Diver",
    color: ["blue", "aqua", "black"],
  },
  {
    id: 15,
    title: "cyberpunk city",
    image: "/cyberpunkcity.jpg",
    createAt: "03/25/24",
    tagNum: "#55967",
    createdBy: "Tech Guru",
    color: ["purple", "pink", "neon green"],
  },
  {
    id: 16,
    title: "ancient ruins",
    image: "/ancientruins.jpg",
    createAt: "03/28/24",
    tagNum: "#55974",
    createdBy: "Archaeologist",
    color: ["brown", "grey", "beige"],
  },
  {
    id: 17,
    title: "skylight dreams",
    image: "/skylightdreams.jpg",
    createAt: "03/30/24",
    tagNum: "#55981",
    createdBy: "Astronomer",
    color: ["blue", "purple", "white"],
  },
  {
    id: 18,
    title: "desert wanderer",
    image: "/desertwanderer.jpg",
    createAt: "04/01/24",
    tagNum: "#55989",
    createdBy: "Nomad",
    color: ["yellow", "brown", "red"],
  },
  {
    id: 19,
    title: "jungle adventure",
    image: "/jungleadventure.jpg",
    createAt: "04/03/24",
    tagNum: "#55995",
    createdBy: "Explorer",
    color: ["green", "brown", "orange"],
  },
  {
    id: 20,
    title: "northern lights",
    image: "/northernlights.jpg",
    createAt: "04/05/24",
    tagNum: "#56001",
    createdBy: "Aurora Chaser",
    color: ["green", "purple", "blue"],
  },
  {
    id: 21,
    title: "forest guardian",
    image: "/forestguardian.jpg",
    createAt: "04/08/24",
    tagNum: "#56012",
    createdBy: "Wildlife Protector",
    color: ["green", "brown", "gold"],
  },
  {
    id: 22,
    title: "volcano eruption",
    image: "/volcanoeruption.jpg",
    createAt: "04/10/24",
    tagNum: "#56018",
    createdBy: "Geologist",
    color: ["red", "orange", "black"],
  },
  {
    id: 23,
    title: "mystic cavern",
    image: "/mysticcavern.jpg",
    createAt: "04/12/24",
    tagNum: "#56023",
    createdBy: "Cave Explorer",
    color: ["purple", "blue", "grey"],
  },
  {
    id: 24,
    title: "windy hills",
    image: "/windyhills.jpg",
    createAt: "04/14/24",
    tagNum: "#56035",
    createdBy: "Hill Climber",
    color: ["green", "blue", "white"],
  },
  {
    id: 25,
    title: "urban skyline",
    image: "/urbanskyline.jpg",
    createAt: "04/16/24",
    tagNum: "#56048",
    createdBy: "City Planner",
    color: ["grey", "blue", "yellow"],
  },
  {
    id: 26,
    title: "mysterious forest",
    image: "/mysteriousforest.jpg",
    createAt: "04/18/24",
    tagNum: "#56056",
    createdBy: "Wanderer",
    color: ["green", "black", "dark brown"],
  },
  {
    id: 27,
    title: "glacial expedition",
    image: "/glacialexpedition.jpg",
    createAt: "04/20/24",
    tagNum: "#56062",
    createdBy: "Polar Explorer",
    color: ["white", "blue", "grey"],
  },
  {
    id: 28,
    title: "retro arcade",
    image: "/retroarcade.jpg",
    createAt: "04/22/24",
    tagNum: "#56071",
    createdBy: "Gamer",
    color: ["neon green", "pink", "black"],
  },
  {
    id: 29,
    title: "golden desert",
    image: "/goldendesert.jpg",
    createAt: "04/24/24",
    tagNum: "#56085",
    createdBy: "Desert Traveler",
    color: ["gold", "yellow", "orange"],
  },
  {
    id: 30,
    title: "crystal caves",
    image: "/crystalcaves.jpg",
    createAt: "04/26/24",
    tagNum: "#56094",
    createdBy: "Gem Hunter",
    color: ["purple", "blue", "white"],
  },
  {
    id: 31,
    title: "zen garden",
    image: "/zengarden.jpg",
    createAt: "04/28/24",
    tagNum: "#56105",
    createdBy: "Meditation Master",
    color: ["green", "white", "brown"],
  },
  {
    id: 32,
    title: "robot revolution",
    image: "/robotrevolution.jpg",
    createAt: "04/30/24",
    tagNum: "#56116",
    createdBy: "Engineer",
    color: ["silver", "blue", "red"],
  },
  {
    id: 33,
    title: "enchanted castle",
    image: "/enchantedcastle.jpg",
    createAt: "05/02/24",
    tagNum: "#56125",
    createdBy: "Storyteller",
    color: ["purple", "gold", "white"],
  },
  {
    id: 34,
    title: "haunted mansion",
    image: "/hauntedmansion.jpg",
    createAt: "05/04/24",
    tagNum: "#56137",
    createdBy: "Ghost Hunter",
    color: ["black", "grey", "blue"],
  },
  {
    id: 35,
    title: "deep space",
    image: "/deepspace.jpg",
    createAt: "05/06/24",
    tagNum: "#56142",
    createdBy: "Astronaut",
    color: ["black", "blue", "silver"],
  },
  {
    id: 36,
    title: "sahara adventure",
    image: "/saharaadventure.jpg",
    createAt: "05/08/24",
    tagNum: "#56154",
    createdBy: "Explorer",
    color: ["sand", "brown", "yellow"],
  },
  {
    id: 37,
    title: "hidden waterfall",
    image: "/hiddenwaterfall.jpg",
    createAt: "05/10/24",
    tagNum: "#56161",
    createdBy: "Nature Lover",
    color: ["blue", "green", "white"],
  },
  {
    id: 38,
    title: "alien landscape",
    image: "/alienlandscape.jpg",
    createAt: "05/12/24",
    tagNum: "#56176",
    createdBy: "Sci-Fi Fan",
    color: ["green", "purple", "blue"],
  },
  {
    id: 39,
    title: "frozen tundra",
    image: "/frozentundra.jpg",
    createAt: "05/14/24",
    tagNum: "#56185",
    createdBy: "Ice Explorer",
    color: ["white", "blue", "grey"],
  },
  {
    id: 40,
    title: "victorian steampunk",
    image: "/victoriansteampunk.jpg",
    createAt: "05/16/24",
    tagNum: "#56198",
    createdBy: "Inventor",
    color: ["brown", "gold", "black"],
  },
];

const attributes = ["title", "tagNum", "createAt", "createdBy", "image"];

export default function HomePage() {
  // handle attributes dynamically
  const [specificTag, setSelectedTag] = useState<Record<string, string> | null>(
    null
  );

  const handleOpenModal = (tag: Record<string, any>) => {
    const selectedTag = attributes.reduce((acc, attribute) => {
      acc[attribute] = tag[attribute];
      return acc;
    }, {} as Record<string, string>);

    setSelectedTag(selectedTag);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // add collectible form modal open handler
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // edit collectible
  const openEdit = () => {
    setShowEdit(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
  };

  const [isOwned, setIsOwned] = useState(true);
  const [showModal, setShowModal] = useState(false); // card component
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
  const processedTags = [...tags]
    .filter((tag) => {
      if (selectedColors.length > 0) {
        // check array
        return tag.color.some((color) =>
          selectedColors.includes(color.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createAt);
      const dateB = new Date(b.createAt);
      const tagNumA = parseInt(a.tagNum.replace("#", ""));
      const tagNumB = parseInt(b.tagNum.replace("#", ""));

      switch (selectedSort) {
        case "yearLowToHigh":
          return dateA.getTime() - dateB.getTime();
        case "yearHighToLow":
          return dateB.getTime() - dateA.getTime();
        case "tagLowToHigh":
          return tagNumA - tagNumB;
        case "tagHighToLow":
          return tagNumB - tagNumA;
        default:
          return 0;
      }
    });

  const [currentPage, setCurrentPage] = useState<number>(1);
  // calculate total pages
  const totalPages: number = Math.ceil(processedTags.length / ITEMS_PER_PAGE);

  // get items for the current page
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedTags = processedTags.slice(startIdx, endIdx);

  // handle page change
  const handlePageChange = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  // -------------- handle heart click-------------------
  const [filledHeartIds, setFilledHeartIds] = useState<number[]>([]);

  const handleHeartClick = (tagId: number) => {
    setFilledHeartIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // ------------------- search ------------------------
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Error handler for search queries
  const handleError = (error: any) => {
    console.error("Search error:", error);
    alert("An error occurred during the search. Please try again.");
  };

  //--------------------- handle form field ------------------------
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  // handle form field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // form data for submission
    const submittedData = {
      ...formData,
      image: imageFile,
    };
    console.log("Submitted data:", submittedData);
    closeModal();
  };

  // --------------------- get user information -----------------
  const [userId, setUserId] = useState<any>(null);
  const { collectionId } = useParams<{ collectionId: string }>();

  useEffect(() => {
    // user.loginId to get email
    const fetchUserDetails = async () => {
      try {
        const user = await fetchUserLoginDetails();
        setUserId(user || "");
        console.log(userId);
      } catch (error) {
        console.error("Error Fetching User");
      }
    };
    fetchUserDetails();
  }, []);

  if (!collectionId) {
    return <div>Error: Collection ID is missing!</div>;
  }

  return (
    <>
      <div>
        <Header />
        <div className="w-full mx-auto pt-16">
          <div className="mx-auto pl-10">
            {/* collection option */}
            {isOwned ? (
              <select className="select select-bordered font-bold text-xl text-black bg-yellow-300 rounded-full px-5 pt-2 pb-3 w-fit">
                <option className="dropdown-content menu bg-yellow-100 rounded-box z-[1] w-52 p-2 shadow text-lg">
                  PathTags
                </option>
                <option className="dropdown-content menu bg-yellow-100 rounded-box z-[1] w-52 p-2 shadow text-lg">
                  Baseball card
                </option>
                <option className="dropdown-content menu bg-yellow-100 rounded-box z-[1] w-52 p-2 shadow text-lg">
                  Nutcraker
                </option>
              </select>
            ) : (
              <h2 className="px-14 font-manrope font-bold text-4xl text-center w-fit">
                Pathtags
              </h2>
            )}

            <div className="flex md:items-center justify-center gap-8 py-9 max-md:px-4">
              {/* Search bar */}
              <SearchBar
                attributes={attributes}
                fetchSearchResults={(tags) =>
                  fetchSearchResults(tags, userId, collectionId)
                }
                handleError={handleError}
                userId={userId}
                collectionId={collectionId}
              />

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
                  <button
                    className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full w-fit"
                    onClick={openModal}
                  >
                    New Collectible
                    <IoIosAdd />
                  </button>
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:w-3/4 lg:w-[480px]">
                      <h2 className="text-xl font-bold mb-4 dark:text-gray-300">
                        Create New Collectible
                      </h2>

                      <form onSubmit={handleSubmit}>
                        {attributes.map((attribute, index) => (
                          <div key={index} className="mb-4 lg:max-w-lg">
                            {attribute !== "image" ? (
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

                <div className="dropdown">
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
                </div>

                <div className="dropdown">
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
                    {/* Color Filter */}
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col md:flex-row">
          {/* collectibles */}
          <div className="w-full p-2">
            {/* switch between grid and list */}
            {view === "list" ? (
              <div className="flex flex-wrap -mx-4">
                {paginatedTags.map((item: { [key: string]: any }) => (
                  <div key={item.id} className="w-full md:w-1/2 px-4 mb-6">
                    <div className="flex items-center space-x-4 p-4 hover:shadow-xl dark:bg-base-300 rounded-xl">
                      <button
                        className="text-xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                        onClick={() => handleHeartClick(item.id)}
                      >
                        {filledHeartIds.includes(item.id) ? (
                          <FaHeart color="red" />
                        ) : (
                          <FaRegHeart />
                        )}
                      </button>
                      <div className="h-24 w-24">
                        <img
                          src={item.image}
                          alt={item.title}
                          width={100}
                          height={100}
                          className="rounded-md shadow-sm object-cover"
                          onClick={() => handleOpenModal(item)}
                        />
                      </div>

                      <div className="flex-1">
                        {/* show first three attributes */}
                        {attributes.slice(0, 3).map((attribute, index) => (
                          <p
                            key={attribute}
                            className={
                              index === 0
                                ? "mt-4 text-lg font-bold pl-4 uppercase truncate"
                                : "text-md font-semibold pl-4 capitalize truncate"
                            }
                          >
                            {` ${item[attribute] || ""}`}
                          </p>
                        ))}
                      </div>
                      <div className="flex space-x-4">
                        <button
                          className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                          onClick={openEdit}
                        >
                          <FaRegEdit />
                        </button>
                        <button className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full">
                          <FaRegTrashCan />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 grid lg:grid-cols-6 gap-10 md:grid-cols-4 sm:grid-cols-4">
                {paginatedTags.map((item: { [key: string]: any }) => (
                  <div key={item.id}>
                    <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                      <div className="h-22 w-30">
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            className="text-xl font-extrabold w-fit px-3 py-1 text-[#7b4106] hover:text-yellow-600 rounded-full"
                            onClick={() => handleHeartClick(item.id)}
                          >
                            {filledHeartIds.includes(item.id) ? (
                              <FaHeart color="red" />
                            ) : (
                              <FaRegHeart />
                            )}
                          </button>
                        </div>
                        <img
                          src={item.image}
                          alt={item.title}
                          width={400}
                          height={400}
                          className="pt-3 rounded-md shadow-sm object-cover object-top"
                          onClick={() => handleOpenModal(item)}
                        />
                      </div>

                      {/* show first three attribute */}
                      <div className="space-y-1 p-4">
                        {attributes.slice(0, 3).map((attribute, index) => (
                          <p
                            key={attribute}
                            className={
                              index === 0
                                ? "mt-4 text-lg font-bold pl-4 uppercase truncate"
                                : "text-md font-semibold pl-4 capitalize truncate"
                            }
                          >
                            {/* Dynamically display attribute name and value */}
                            {`${item[attribute] || ""}`}
                          </p>
                        ))}

                        <div className="pt-3 pb-2 text-center">
                          <button
                            className="w-fit px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full"
                            onClick={openEdit}
                          >
                            <FaRegEdit />
                          </button>
                          <button className="w-fit ml-4 px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full">
                            <FaRegTrashCan />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* send data to modal */}
            {showModal && specificTag && (
              <Modal
                attributes={attributes}
                tagData={specificTag}
                onClose={handleCloseModal}
                isVisible={showModal}
              />
            )}

            {showEdit && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-8 sm:w-3/4 lg:w-[480px]">
                  <h2 className="text-xl font-bold mb-4">
                    Edit your Collectible
                  </h2>

                  <form onSubmit={handleSubmit}>
                    {attributes.map((attribute, index) => (
                      <div key={index} className="mb-4 lg:max-w-lg">
                        {attribute !== "image" ? (
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
                        ) : (
                          <>
                            <label
                              htmlFor="cover-photo"
                              className="block text-sm font-bold leading-6 text-gray-900 dark:text-gray-300"
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
                                  <p className="pl-1">or drag and drop</p>
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

        {/* Pagination */}
        <nav className="flex items-center justify-between px-4 sm:px-0 mt-8">
          {/* Left Arrow */}
          <div className="flex-1 flex justify-start ml-20">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center border-t-2 border-transparent px-6 pt-4 text-md text-gray-500 hover:border-gray-300"
            >
              <ArrowLongLeftIcon
                aria-hidden="true"
                className="h-8 w-8 text-gray-400"
              />
            </button>
          </div>

          {/* Page Numbers */}
          <div className="flex items-center justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`inline-flex items-center border-t-4 px-4 pt-4 text-lg font-bold ${
                  currentPage === i + 1
                    ? "border-yellow-600 text-yellow-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          <div className="flex-1 flex justify-end mr-20">
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center border-t-2 border-transparent px-6 pt-4 text-md text-gray-500 hover:border-gray-300"
            >
              <ArrowLongRightIcon
                aria-hidden="true"
                className="h-8 w-8 text-gray-400"
              />
            </button>
          </div>
        </nav>
        <Footer />
      </div>
    </>
  );
}
