import React, { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

interface SearchBarProps {
  attributes: string[];
  onResetSearch: () => void;
  resetDropdown: boolean;
  setResetDropdown: (value: boolean) => void;
  onSearch: (tags: { attribute: string; term: string }[]) => void;
  onJump: (tags: { attribute: string; term: string }[]) => void;
  onSortOrder: (order: string) => void;
  onSortBy: (attribute: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  attributes,
  onResetSearch,
  resetDropdown,
  setResetDropdown,
  onSearch,
  onJump,
  onSortOrder,
  onSortBy,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(attributes[0]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchTags, setSearchTags] = useState<
    { attribute: string; term: string }[]
  >([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState<string>(attributes[0]);
  const [currentMode, setCurrentMode] = useState<"search" | "jump">("search");

  useEffect(() => {
    if (attributes && attributes.length > 0) {
      setSelectedOption(attributes[0]);
      setSortBy(attributes[0]);
      onSortBy(attributes[0]);
      setSortOrder("asc");
    }
  }, [attributes]);

  useEffect(() => {
    if (resetDropdown) {
      setSelectedOption(attributes[0]);
      setSearchTags([]);
      setResetDropdown(false);
      setSortBy(attributes[0]);
      setSortOrder("asc");
    }
  }, [resetDropdown, setResetDropdown, attributes]);

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
    onSortOrder(order);
  };

  const handleSortByChange = (attribute: string) => {
    setSortBy(attribute);
    onSortBy(attribute);
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault();
      const newTag = { attribute: selectedOption, term: searchTerm.trim() };
      if (
        !searchTags.some(
          (tag) =>
            tag.attribute === newTag.attribute && tag.term === newTag.term
        )
      ) {
        setSearchTags([...searchTags, newTag]);
        setSearchTerm("");
      }
    }
  };

  const deleteSearchTag = (tagToDelete: {
    attribute: string;
    term: string;
  }) => {
    const updatedTags = searchTags.filter((tag) => tag !== tagToDelete);
    setSearchTags(updatedTags);
    if (currentMode === "search") {
      onSearch(updatedTags);
    } else if (currentMode === "jump") {
      onJump(updatedTags);
    }
  };

  // clear all tags
  const handleResetTags = () => {
    setSearchTags([]);
    onResetSearch();
    setCurrentMode("search");
  };

  const handleSearch = () => {
    if (searchTags.length === 0) {
      alert("Please add at least one search tag.");
      return;
    }
    setCurrentMode("search");
    onSearch(searchTags);
  };

  const handleJump = () => {
    if (searchTags.length === 0) {
      alert("Please add at least one search tag.");
      return;
    }
    setCurrentMode("jump");
    onJump(searchTags);
  };

  return (
    <div className="flex flex-col justify-center mt-8">
      <div className="relative items-center">
        <div className="flex items-center">
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="flex-shrink-0 z-50 inline-flex items-center h-14 px-4 text-md font-semibold text-black bg-yellow-300 border rounded-l-lg hover:bg-yellow-200">
                {selectedOption}
                <ChevronDownIcon className="ml-1 h-5 w-5 text-gray-500" />
              </MenuButton>
            </div>

            {/* attributes section */}
            <MenuItems
              className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-48 z-10"
              style={{ maxHeight: "450px", overflowY: "auto" }}
            >
              <ul className="py-1">
                <p className="px-3 py-2 font-bold dark:text-black">
                  Attributes:
                </p>
                {attributes.map((attribute) => (
                  <MenuItem key={attribute}>
                    <li
                      className="px-4 py-2 cursor-pointer font-semibold 
                           hover:bg-gray-100 text-gray-900"
                      onClick={() => setSelectedOption(attribute)}
                    >
                      {attribute}
                    </li>
                  </MenuItem>
                ))}
              </ul>

              {/* sort by section */}
              <ul className="py-1 dark:text-black">
                <p className="px-3 py-2 font-bold">Sort by:</p>
                {attributes.map((attribute) => (
                  <div key={attribute}>
                    <li className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={attribute}
                          name="attribute"
                          checked={sortBy === attribute}
                          onChange={() => handleSortByChange(attribute)}
                          className="h-4 w-4 text-yellow-400 border-gray-300 focus:ring-1 focus:ring-yellow-400"
                        />
                        <label
                          htmlFor={attribute}
                          className="cursor-pointer font-semibold"
                        >
                          {attribute}
                        </label>
                      </div>
                    </li>
                  </div>
                ))}
              </ul>

              {/* sort order section */}
              <div className="px-4 py-2 border-t border-gray-200 dark:text-black">
                <p className="pb-3 font-bold">Sort order:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="ascending"
                    name="sortOrder"
                    checked={sortOrder === "asc"}
                    onChange={() => handleSortOrderChange("asc")}
                    className="h-4 w-4 text-yellow-400 border-gray-300 focus:ring-2 focus:ring-yellow-400"
                  />
                  <label
                    htmlFor="ascending"
                    className="text-md font-semibold cursor-pointer"
                  >
                    Ascending
                  </label>
                </div>
              </div>
              <div className="px-4 py-2 dark:text-black">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="descending"
                    name="sortOrder"
                    checked={sortOrder === "desc"}
                    onChange={() => handleSortOrderChange("desc")}
                    className="h-4 w-4 text-yellow-400 border-gray-300 focus:ring-2 focus:ring-yellow-400"
                  />
                  <label
                    htmlFor="descending"
                    className="text-md font-semibold cursor-pointer"
                  >
                    Descending
                  </label>
                </div>
              </div>
            </MenuItems>
          </Menu>

          {/* Input Box */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleEnterPress}
            placeholder="What are you looking for today?"
            className="flex-grow border-none ring-1 ring-gray-200 w-96 p-4 rounded-sm"
          />

          {/* Search Button */}
          <button
            className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full px-4 py-2 ml-2"
            onClick={handleSearch}
          >
            Search
            <FaMagnifyingGlass />
          </button>
          <button
            className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full px-4 py-2 ml-2"
            onClick={handleJump}
          >
            Jump
            <FaMagnifyingGlass />
          </button>
        </div>
      </div>

      {/* Search Tags */}
      <div className="flex flex-wrap mt-2">
        {searchTags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-primary text-black font-semibold text-lg rounded-md pl-4 pr-2 py-1 mr-3 mt-2"
          >
            {`${tag.attribute}: ${tag.term}`}
            <button className="pl-4" onClick={() => deleteSearchTag(tag)}>
              <IoMdClose />
            </button>
          </div>
        ))}

        {/* Reset Button */}
        {searchTags.length > 0 && (
          <button
            className="ml-3 text-lg text-black bg-yellow-400 rounded-full px-4 py-2 mt-2"
            onClick={handleResetTags}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
