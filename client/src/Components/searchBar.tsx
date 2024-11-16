import React, { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdArrowDropdown, IoMdClose } from "react-icons/io";

interface SearchBarProps {
  attributes: string[];
  onResetSearch: () => void;
  resetDropdown: boolean;
  setResetDropdown: (value: boolean) => void;
  onSearch: (tags: { attribute: string; term: string }[]) => void;
  onJump: (tags: { attribute: string; term: string }[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  attributes,
  onResetSearch,
  resetDropdown,
  setResetDropdown,
  onSearch,
  onJump,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(attributes[0]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTags, setSearchTags] = useState<
    { attribute: string; term: string }[]
  >([]);

  useEffect(() => {
    if (attributes && attributes.length > 0) {
      setSelectedOption(attributes[0]);
    }
  }, [attributes]);

  useEffect(() => {
    if (resetDropdown) {
      setSelectedOption(attributes[0]);
      setSearchTags([]);
      setResetDropdown(false);
    }
  }, [resetDropdown, setResetDropdown]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
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
    setSearchTags(searchTags.filter((tag) => tag !== tagToDelete));
  };

  // clear all tags
  const handleResetTags = () => {
    setSearchTags([]);
    onResetSearch();
  };

  const handleSearch = () => {
    if (searchTags.length === 0) {
      alert("Please add at least one search tag.");
      return;
    }
    onSearch(searchTags);
  };

  const handleJump = () => {
    if (searchTags.length === 0) {
      alert("Please add at least one search tag.");
      return;
    }
    onJump(searchTags);
  };

  return (
    <div className="flex flex-col justify-center mt-8 ">
      <div className="relative items-center">
        <div className="flex items-center">
          {/* Dropdown Button */}
          <div className="flex items-center">
            {/* Dropdown Button */}
            <button
              id="dropdown-button"
              className="flex-shrink-0 z-50 inline-flex items-center h-14 px-4 text-md font-semibold text-black bg-yellow-300 border rounded-l-lg hover:bg-yellow-200 dark:bg-yellow-100 dark:hover:bg-yellow-200 dark:text-black"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedOption}
              <IoMdArrowDropdown className="text-2xl pl-1" />
            </button>

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

        {/* Dropdown List */}
        {isDropdownOpen && (
          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-48 z-10">
            <ul className="py-1">
              {attributes.map((attribute) => (
                <li
                  key={attribute}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleOptionSelect(attribute)}
                >
                  {attribute}
                </li>
              ))}
            </ul>
          </div>
        )}
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
