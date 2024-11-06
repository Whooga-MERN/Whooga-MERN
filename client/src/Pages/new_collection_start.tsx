import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../Components/Header";

import { Collection } from "../Types/Collection";
import { buildPath } from "../utils/utils";

function NewCollectionStart(){
    const [collectionName, setCollectionName] = useState('');
    const [isInputEmpty, setIsInputEmpty] = useState(false);
    const [collectionSearchResults, setCollectionSearchResults] = useState<string[]>([]);
    const navigate = useNavigate();


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setCollectionName(event.target.value);
    };

    const handleContinue = async () => {
        localStorage.setItem('collectionName', collectionName);
        if (collectionName === '') {
            setIsInputEmpty(true);
            return;
        }
        
        try {
          // Insert API call here to search for a Collection by name

          //const response = await fetch(`https://api.example.com/search?query=${collectionName}`);
          //const data = await response.json();
          //setCollectionSearchResults(data.results);
          //navigate('/new_collection_form', { state: { searchResults: data.results } });


          const response = await fetch(buildPath(`publish/display-published-universes?searchTerm=${collectionName}`), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          console.log(data);

          if (data.length === 0) {
              // If no search results, navigate to new_collection_form
              navigate('/new_collection_form');
              return;
          }
          navigate('/new_collection_search_matches', { state: { searchResults: data } });

        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    return (
        <>
        <Header />
        <div className="w-full">
          <div className="flex items-center justify-center">
            <h2 className="px-16 pt-14 font-manrope font-bold text-4xl text-center">
              What are you collecting?
            </h2>
          </div>
        </div>

        {/* Collection Prompt */}
        <div className="flex flex-col items-center justify-center w-1/2 mx-auto">
            <div className="flex flex-col justify-center w-full pt-6">
              <p className="text-red-500 text-md">{isInputEmpty ? '* Please enter a collection name *' : ''}</p>
                <input type="text"
                placeholder="Name any collectable..."
                id="collectionName" 
                className="w-full h-12 mt-2 border-2 border-gray-300 rounded-md px-4"
                onChange={handleInputChange} />
            </div>
            
            <button
                className="btn btn-primary text-xl mt-4 self-end"
                onClick={handleContinue}>Continue
            </button>
        </div>
        </>
    )
}

export default NewCollectionStart;