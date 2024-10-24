import React, { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdArrowDropdown, IoMdClose } from "react-icons/io";

interface SearchBarProps {
  attributes: string[];
  fetchOwnedSearchResults: (
    tags: { attribute: string; term: string }[],
    userId: string,
    collectionId: string
  ) => Promise<any>;
  fetchUniverseSearchResults: (
    tags: { attribute: string; term: string }[],
    userId: string,
    universeCollectionId: string
  ) => Promise<any>;
  handleError: (error: any) => void;
  userId: string;
  collectionId: string;
  universeCollectionId: string;
  onSearchResults: (results: any[]) => void;
  onResetSearch: () => void;
  resetDropdown: boolean;
  setResetDropdown: (value: boolean) => void;
  isOwnedEnabled: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  attributes,
  userId,
  collectionId,
  universeCollectionId,
  fetchOwnedSearchResults,
  fetchUniverseSearchResults,
  handleError,
  onSearchResults,
  onResetSearch,
  isOwnedEnabled,
  resetDropdown,
  setResetDropdown,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(attributes[0]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTags, setSearchTags] = useState<
    { attribute: string; term: string }[]
  >([]);

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

  const handleSearch = async () => {
    if (searchTags.length === 0) {
      alert("Please add at least one search tag.");
      return;
    }

    try {
      let searchResults;
      if (isOwnedEnabled) {
        // Fetch results for owned collectables
        searchResults = await fetchOwnedSearchResults(
          searchTags,
          userId,
          collectionId
        );
      } else {
        // Fetch results for universe collectables
        searchResults = await fetchUniverseSearchResults(
          searchTags,
          userId,
          universeCollectionId
        );
      }
      onSearchResults(searchResults);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="flex flex-col justify-center mt-8">
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
          onClick={handleSearch}
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
