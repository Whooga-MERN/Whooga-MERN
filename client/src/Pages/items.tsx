import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaListUl,
  FaRegEdit,
  FaSortAmountDown,
  FaFilter,
} from "react-icons/fa";
import { BsFillGridFill } from "react-icons/bs";
import { FaMagnifyingGlass, FaRegTrashCan } from "react-icons/fa6";
import { IoIosAdd } from "react-icons/io";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

import Header from "../Components/Header";
import Modal from "../Components/Modal";
import Footer from "../Components/Footer";

const sortBy = [
  { id: "yearLowToHigh", label: "Year: Low to High" },
  { id: "yearHighToLow", label: "Year: High to Low" },
  { id: "tagLowToHigh", label: "Tag ID: Low to High" },
  { id: "tagHighToLow", label: "Tag ID: High to Low" },
];
const color = ["Purple", "Red", "yellow", "pink", "brown", "blue", "orange"];
const formFields = [
  { label: "Title", placeholder: "Collectible Name", type: "text" },
  { label: "Tag ID", placeholder: "Tag ID", type: "text" },
  { label: "Tag Owner", placeholder: "Tag Owner", type: "text" },
  { label: "Created Date", placeholder: "Created Date", type: "text" },
  {
    label: "Description",
    placeholder: "Collectible Description",
    type: "textarea",
  },
];

const option = [
  {
    id: "sort",
    title: "sort By",
    options: sortBy,
    inputType: "radio",
  },
  {
    id: "colors",
    title: "Colors",
    options: color,
    inputType: "checkbox",
  },
];

interface filterButtons {
  children: React.ReactNode;
}

interface checkItems extends React.ComponentPropsWithoutRef<"input"> {
  label: string;
}

function CheckButtons({ children }: filterButtons) {
  return <div className="flex flex-items hover:opacity-75">{children}</div>;
}

function CheckItem({ id, label, ...props }: checkItems) {
  return (
    <div>
      <input id={id} className="w-3 h-3 shrink-0 mr-3" {...props} />
      <label htmlFor={id} className="text-md">
        {label}
      </label>
    </div>
  );
}

const tags = [
  {
    id: 1,
    title: "eagle",
    image: "/eagle.jpg",
    createAt: "03/12/24",
    tagNum: "#55988",
    createdBy: "This person",
    color: "purple",
  },
  {
    id: 2,
    title: "psycho",
    image: "/psycho.jpg",
    createAt: "3/06/24",
    tagNum: "#55927",
    createdBy: "That person",
  },
  {
    id: 3,
    title: "shawshank",
    image: "/shawshank.jpg",
    createAt: "02/28/24",
    tagNum: "#55881",
    createdBy: "Those person",
  },
  {
    id: 4,
    title: "golddog",
    image: "/golddog.jpg",
    createAt: "03/04/24",
    tagNum: "#55915",
    createdBy: "This group",
  },
  {
    id: 5,
    title: "Bear",
    image: "/bear.jpg",
    createAt: "03/12/24",
    tagNum: "#55996",
    createdBy: "That group",
  },
  {
    id: 6,
    title: "Ghostbusters",
    image: "/ghostbusters.jpg",
    createAt: "02/03/24",
    tagNum: "#55697",
    createdBy: "Those groups",
  },
  {
    id: 7,
    title: "braveheart",
    image: "/braveheart.jpg",
    createAt: "03/12/24",
    tagNum: "#55994",
    createdBy: "me",
  },
  {
    id: 8,
    title: "tiny toon",
    image: "/tinytoon.jpg",
    createAt: "03/07/24",
    tagNum: "#55958",
    createdBy: "He",
  },
  {
    id: 9,
    title: "alien invasion club",
    image: "/alienclub.jpg",
    createAt: "03/06/24",
    tagNum: "#55949",
    createdBy: "She",
  },
  {
    id: 10,
    title: "lisboa portugal train 28",
    image: "/lisboaportugal28.jpg",
    createAt: "03/05/24",
    tagNum: "#55917",
    createdBy: "Them",
  },
];

export default function HomePage() {
  // assign specific tag with all attribute
  const [specificTag, setSelectedTag] = useState<{
    id: number;
    title: string;
    createAt: string;
    image: string;
    tagNum: string;
    createdBy: string;
  } | null>(null);

  // set whole tag and open modal
  const handleOpenModal = (tag: {
    id: number;
    title: string;
    createAt: string;
    image: string;
    tagNum: string;
    createdBy: string;
  }) => {
    setSelectedTag(tag);
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

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSort(e.target.value);
  };

  const sortedTags = [...tags].sort((a, b) => {
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

            <div className="flex flex-col md:flex-row md:items-center justify-center gap-8 py-9 max-md:px-4">
              {/* Search bar */}
              <div className="">
                <div className="pl-4 lg:w-[500px] relative sm: w-[400px] border-none">
                  <div className="relative border-none">
                    <input
                      type="search"
                      placeholder=" What are you looking for today?"
                      className="border-none ring-1 ring-gray-200 w-full p-4 rounded-lg"
                    ></input>
                    <button className="absolute right-1 top-1/2 -translate-y-1/2 p-4 rounded-full">
                      <FaMagnifyingGlass />
                    </button>
                  </div>
                </div>
              </div>
              {/* icon button for view*/}
              <div className="hidden lg:block md:block">
                <button className="inline-block pr-5">
                  <FaListUl />
                </button>
                <button className="inline-block pr-16">
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:w-3/4 lg:w-1/3">
                      <h2 className="text-xl mb-4 dark:text-gray-300">
                        Create New Collectible
                      </h2>

                      <form>
                        {formFields.map((field, index) => (
                          <div key={index} className="mb-4 lg:max-w-lg">
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                              {field.label}
                            </label>
                            {field.type === "textarea" ? (
                              <textarea
                                placeholder={field.placeholder}
                                className="border rounded w-full py-2 px-3 text-gray-700"
                              />
                            ) : (
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                className="border rounded w-full py-2 px-3 text-gray-700"
                              />
                            )}
                          </div>
                        ))}

                        <label
                          htmlFor="cover-photo"
                          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300"
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
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">
                              PNG, JPG
                            </p>
                          </div>
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
                    {/* {option.map(({ id, title, options, inputType }) => {
                      return (
                        <div className="border-b pb-4" key={id}>
                          <p className="font-medium mb-4 pt-5 pl-5 capitalize">
                            {title}
                          </p>
                          <div className="space-y-2 pl-5">
                            {options.map((value) => {
                              return (
                                <CheckButtons key={value}>
                                  <CheckItem
                                    type={inputType}
                                    name={id}
                                    label={value}
                                    id={value.toLowerCase().trim()}
                                    value={value.toLowerCase().trim()}
                                  />
                                </CheckButtons>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })} */}
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
                    <div className="space-y-4">
                      {/* {option.map(({ id, title, options, inputType }) => {
                        return (
                          <div className="border-b pb-4" key={id}>
                            <p className="font-medium mb-4 pt-5 pl-5 capitalize">
                              {title}
                            </p>
                            <div className="space-y-2 pl-5">
                              {options.map((value) => {
                                return (
                                  <CheckButtons key={value}>
                                    <CheckItem
                                      type={inputType}
                                      name={id}
                                      label={value}
                                      id={value.toLowerCase().trim()}
                                      value={value.toLowerCase().trim()}
                                    />
                                  </CheckButtons>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })} */}
                    </div>
                    {/* {option.map(({ id, title, options, inputType }) => {
                      return (
                        <div className="border-b pb-4" key={id}>
                          <p className="font-medium mb-4 pt-5 pl-5 capitalize">
                            {title}
                          </p>
                          <div className="space-y-2 pl-5">
                            {options.map((value) => {
                              return (
                                <CheckButtons key={value}>
                                  <CheckItem
                                    type={inputType}
                                    name={id}
                                    label={value}
                                    id={value.toLowerCase().trim()}
                                    value={value.toLowerCase().trim()}
                                  />
                                </CheckButtons>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })} */}
                  </ul>
                  {/* <div className="mt-8 grid lg:grid-cols-7 gap-10 md:grid-cols-4 sm:grid-cols-4">
                    {sortedTags.map((tag) => (
                      <div key={tag.id}>
                        <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                          <div className="h-22 w-30">
                            <img
                              src={tag.image}
                              alt={tag.title}
                              width={400}
                              height={400}
                              className="rounded-md shadow-sm object-cover object-top"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="mt-4 font-semibold pl-4 uppercase truncate">
                              {tag.tagNum}
                            </p>
                            <p className="font-bold pl-4 uppercase truncate">
                              {tag.title}
                            </p>

                            <div className="pt-3 pb-2 text-center">
                              <button className="w-fit px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full">
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
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col md:flex-row">
          {/* collectibles */}
          <div className="w-full p-2">
            {/* <div className="mt-8 grid lg:grid-cols-7 gap-10 md:grid-cols-4 sm:grid-cols-4">
              {tags.map((tag) => (
                <div key={tag.id}>
                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                    <div className="h-22 w-30">
                      <img
                        src={tag.image}
                        alt={tag.title}
                        width={400}
                        height={400}
                        className="rounded-md shadow-sm object-cover object-top"
                        onClick={() => handleOpenModal(tag)}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="mt-4 font-semibold pl-4 uppercase truncate">
                        {tag.tagNum}
                      </p>
                      <p className="font-bold pl-4 uppercase truncate">
                        {tag.title}
                      </p>

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
            </div> */}
            <div className="mt-8 grid lg:grid-cols-7 gap-10 md:grid-cols-4 sm:grid-cols-4">
              {sortedTags.map((tag) => (
                <div key={tag.id}>
                  <div className="relative hover:shadow-xl dark:bg-base-300 rounded-xl">
                    <div className="h-22 w-30">
                      <img
                        src={tag.image}
                        alt={tag.title}
                        width={400}
                        height={400}
                        className="rounded-md shadow-sm object-cover object-top"
                        onClick={() => handleOpenModal(tag)}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="mt-4 font-semibold pl-4 uppercase truncate">
                        {tag.tagNum}
                      </p>
                      <p className="font-bold pl-4 uppercase truncate">
                        {tag.title}
                      </p>

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
            {showModal && specificTag && (
              <Modal
                tagNum={specificTag.tagNum}
                tagTitle={specificTag.title}
                tagDate={specificTag.createAt}
                tagImage={specificTag.image}
                tagDesigner={specificTag.createdBy}
                onClose={handleCloseModal}
                isVisible={showModal}
              />
            )}

            {showEdit && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg p-8 sm:w-3/4 lg:w-1/3">
                  <h2 className="text-xl mb-4">Edit your Collectible</h2>

                  <form>
                    {formFields.map((field, index) => (
                      <div key={index} className="mb-4 lg:max-w-lg">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {field.label}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            placeholder={field.placeholder}
                            className="border rounded w-full py-2 px-3 text-gray-700"
                          />
                        ) : (
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            className="border rounded w-full py-2 px-3 text-gray-700"
                          />
                        )}
                      </div>
                    ))}

                    <label
                      htmlFor="cover-photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Upload Photo
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                      <div className="text-center">
                        <PhotoIcon
                          aria-hidden="true"
                          className="mx-auto h-12 w-12 text-gray-300"
                        />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <span>Upload a photo</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">
                          PNG, JPG
                        </p>
                      </div>
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
                        Create
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
