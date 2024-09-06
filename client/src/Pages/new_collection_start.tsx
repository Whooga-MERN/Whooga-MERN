import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../Components/Header";

function NewCollectionStart(){
    const [collectionName, setCollectionName] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionName(event.target.value);
    };

    const handleContinue = () => {
        localStorage.setItem('collectionName', collectionName);
        navigate('/new_collection_form');
    };

    return (
        <>
        <Header />
        <div className="w-full bg-white">
          <div className="flex items-center justify-center">
            <h2 className="px-16 pt-14 font-manrope font-bold text-4xl text-black text-center">
              What are you collecting?
            </h2>
          </div>
        </div>

        {/* Collection Prompt */}
        <div className="flex flex-col items-center justify-center w-1/2 mx-auto">
            <div className="flex flex-col justify-center w-full pt-6">
                <input type="text"
                placeholder="Name any collectable..."
                id="collectionName" 
                className="w-full h-12 mt-2 border-2 border-gray-300 rounded-md px-4"
                onChange={handleInputChange} />
            </div>
            <button
                className="btn btn-primary text-xl mt-4 self-end"
                onClick={handleContinue}>Continue</button>
        </div>
        </>
    )
}

export default NewCollectionStart;