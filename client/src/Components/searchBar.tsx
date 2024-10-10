import React, { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdArrowDropdown, IoMdClose } from "react-icons/io";

interface SearchBarProps {
  attributes: string[];
  fetchSearchResults: (attribute: string, searchTerm: string) => Promise<any>;
  handleError: (error: any) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  attributes,
  fetchSearchResults,
  handleError,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("Options");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTags, setSearchTags] = useState<string[]>([]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault();
      const newTag = `${selectedOption}: ${searchTerm.trim()}`;
      if (!searchTags.includes(newTag)) {
        setSearchTags([...searchTags, newTag]);
        setSearchTerm("");
      }
    }
  };

  const deleteSearchTag = (tag: string) => {
    setSearchTags(searchTags.filter((t) => t !== tag));
  };

  const handleResetTags = () => {
    setSearchTags([]);
  };

  return (
    <div className="flex flex-col justify-center mt-8">
      {/* Search Bar */}
      <div className="relative items-center">
        {/* Dropdown Button */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            id="dropdown-button"
            className="flex-shrink-0 z-10 inline-flex items-center h-full px-4 text-md font-semibold text-black bg-yellow-300 border rounded-l-lg hover:bg-yellow-200 dark:bg-yellow-100 dark:hover:bg-yellow-200 dark:text-black"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedOption}
            <IoMdArrowDropdown className="text-2xl pl-1" />
          </button>
        </div>
        {/* Input Box */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleEnterPress}
          placeholder="What are you looking for today?"
          className="flex-grow border-none ring-1 ring-gray-200 w-96 p-4 rounded-lg pl-32"
        />
        {/* Search Button */}
        <button
          className="btn text-lg text-black bg-yellow-300 hover:bg-yellow-200 rounded-full px-4 py-2 ml-2"
          onClick={() => {
            console.log("Search Button Clicked");
          }}
        >
          Search
          <FaMagnifyingGlass />
        </button>

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
            {tag}
            <button className="pl-4" onClick={() => deleteSearchTag(tag)}>
              <IoMdClose />
            </button>
          </div>
        ))}

        {searchTags.length > 0 && (
          <button
            className="ml-3 text-lg text-black bg-yellow-400 !important rounded-full px-4 py-2 mt-2"
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
