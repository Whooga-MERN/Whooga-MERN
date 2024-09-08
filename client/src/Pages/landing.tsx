"use client";

import React, { useState } from "react";
import Header from "../Components/Header";
import { Link } from "react-router-dom";
import { FaListUl, FaRegEdit } from "react-icons/fa";
import { BsFillGridFill } from "react-icons/bs";
import { FaMagnifyingGlass, FaRegTrashCan } from "react-icons/fa6";
import Modal from "../Components/Modal";
import { IoIosAdd } from "react-icons/io";

const sortBy = ["Year: Low to High", "Year: High to Low"];
const color = ["Red", "Yellow", "Blue", "Green", "Black", "White"];
const collectionList = ["PathTags", "Baseball cards", "Nutcracker"];

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
  },
  {
    id: 2,
    title: "psycho",
    image: "/psycho.jpg",
    createAt: "3/06/24",
    tagNum: "#55927",
  },
  {
    id: 3,
    title: "shawshank",
    image: "/shawshank.jpg",
    createAt: "02/28/24",
    tagNum: "#55881",
  },
  {
    id: 4,
    title: "golddog",
    image: "/golddog.jpg",
    createAt: "03/04/24",
    tagNum: "#55915",
  },
  {
    id: 5,
    title: "Bear",
    image: "/bear.jpg",
    createAt: "03/12/24",
    tagNum: "#55996",
  },
  {
    id: 6,
    title: "Ghostbusters",
    image: "/ghostbusters.jpg",
    createAt: "02/03/24",
    tagNum: "#55697",
  },
  {
    id: 7,
    title: "braveheart",
    image: "/braveheart.jpg",
    createAt: "03/12/24",
    tagNum: "#55994",
  },
  {
    id: 8,
    title: "tiny toon",
    image: "/tinytoon.jpg",
    createAt: "03/07/24",
    tagNum: "#55958",
  },
  {
    id: 9,
    title: "alien invasion club",
    image: "/alienclub.jpg",
    createAt: "03/06/24",
    tagNum: "#55949",
  },
  {
    id: 10,
    title: "lisboa portugal train 28",
    image: "/lisboaportugal28.jpg",
    createAt: "03/05/24",
    tagNum: "#55917",
  },
];

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div>
        <Header />
        <div className="w-full bg-white mx-auto pt-16">
          <div className="mx-auto pl-10">
            {/* collection option */}
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
                <button className="btn font-bold text-lg text-black bg-yellow-300 hover:bg-yelloe-200 rounded-full w-fit">
                  new collectible
                  <IoIosAdd />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* side bar */}
        <div className="w-full flex flex-col md:flex-row">
          {/* <div className="w-full md:w-[15%] p-2">
            <div className="col-span-2 space-y6 top-12 h-fit">
              clear fliter
              <div className="py-2 mb-8 p-5">
                <Link to="/home">
                  <button className="whitespace-nowrap text-white bg-yellow-400 border-yellow-400 hover:bg-yellow-500 hover:shadow-md duration-100 h-11 rounded-lg sm:px-3 lg:px-7 w-auto py-3 font-semibold text-sm shadow-lg shadow-transparent cursor-pointer">
                    Clear filters
                  </button>
                </Link>
              </div>

              {option.map(({ id, title, options, inputType }) => {
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
              })}
            </div>
          </div> */}

          {/* collectibles */}
          <div className="w-full p-2">
            <div className="mt-8 grid lg:grid-cols-7 gap-10 md:grid-cols-4 sm:grid-cols-4">
              {tags.map((tag) => (
                <div key={tag.id} onClick={() => setShowModal(true)}>
                  <div className="relative hover:shadow-xl ">
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
                      <p className="block text-slate-500 text-sm pl-4">
                        {tag.createAt}
                      </p>

                      <div className="pt-3 pl-2 pb-2 text-center">
                        <button className="px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full">
                          <FaRegEdit />
                        </button>
                        <button className="ml-4 px-3 py-1 bg-orange-300 text-[#7b4106] hover:text-white rounded-full">
                          <FaRegTrashCan />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)} />
      </div>
    </>
  );
}
