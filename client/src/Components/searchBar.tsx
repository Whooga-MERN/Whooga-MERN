import React, { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdArrowDropdown } from "react-icons/io";

interface SearchBarProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  attributes: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  selectedOption,
  setSelectedOption,
  searchTerm,
  setSearchTerm,
  attributes,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative border-none">
      {/* Search Box */}
      <input
        type="search"
        placeholder="What are you looking for today?"
        className="border-none ring-1 ring-gray-200 w-full lg:w-[400px] p-4 rounded-lg pl-32"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* dropdown */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          id="dropdown-button"
          className="flex-shrink-0 z-10 inline-flex items-center h-full px-4 text-md text-black bg-yellow-100 border rounded-l-lg hover:bg-yellow-200 dark:bg-yellow-100 dark:hover:bg-yellow-200 dark:text-black"
          style={{ height: "100%" }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {selectedOption}
          <IoMdArrowDropdown className="text-2xl pl-1" />
        </button>
      </div>

      <button className="absolute right-1 top-1/2 -translate-y-1/2 p-4 rounded-full">
        <FaMagnifyingGlass />
      </button>

      {/* Dropdown List */}
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg w-48 z-10">
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
  );
};

export default SearchBar;
