import React, { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdArrowDropdown } from "react-icons/io";
import { useQuery } from "react-query";
import debounce from "lodash.debounce";
import { fetchSearchResults } from "../utils/fetchSearchResults";

interface SearchBarProps {
  attributes: string[];
  fetchSearchResults: (attribute: string, searchTerm: string) => Promise<any>;
  handleError: (error: any) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ attributes, handleError }) => {
  const [selectedOption, setSelectedOption] = useState<string>("Options");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState<string>(searchTerm);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const debounced = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    debounced();

    return () => {
      debounced.cancel();
    };
  }, [searchTerm]);

  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
    isError: searchIsError,
    error: searchError,
  } = useQuery(
    ["search", selectedOption, debouncedSearchTerm],
    () => fetchSearchResults(selectedOption, debouncedSearchTerm),
    {
      enabled: selectedOption !== "Options" && debouncedSearchTerm.length > 0,
      onError: handleError,
    }
  );

  return (
    <div className="relative border-none">
      {/* search */}
      <input
        type="search"
        placeholder="What are you looking for today?"
        className="border-none ring-1 ring-gray-200 w-full lg:w-[400px] p-4 rounded-lg pl-32"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* dropdown*/}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          id="dropdown-button"
          className="flex-shrink-0 z-10 inline-flex items-center h-full px-4 text-md font-semibold text-black bg-yellow-300 border rounded-l-lg hover:bg-yellow-200 dark:bg-yellow-100 dark:hover:bg-yellow-200 dark:text-black"
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

      {/* dropdown list */}
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
