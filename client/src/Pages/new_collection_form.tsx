import React, { useEffect, useState } from 'react';

import { LuChevronDownSquare } from "react-icons/lu";
import { FaPencil } from "react-icons/fa6";
import { FaInfo } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Collection } from '../Types/Collection';

function NewCollectionForm(){

    const [collectionName, setCollectionName] = useState('');
    const [collectionObject, setCollectionObject] = useState<Collection>();
    const [featureTags, setFeatureTags] = useState<string[]>(["test", "test2"]);

    useEffect(() => {
        const storedCollectionName = localStorage.getItem('collectionName');
        if (storedCollectionName) {
            setCollectionName(storedCollectionName);
            setCollectionObject(new Collection(0, storedCollectionName, '', '', false));
        }
    }, []);

    const openModal = () => {
        const modal = document.getElementById('my_modal_3') as HTMLDialogElement | null;
        if (modal) {
            modal.showModal();
        }
    };

    const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const newFeature = (event.target as HTMLInputElement).value;
            setFeatureTags([...featureTags, newFeature]);
            (event.target as HTMLInputElement).value = '';
        }
    };

    const deleteFeatureTag = (tagToDelete: string) => {
    const index = featureTags.findIndex(tag => tag === tagToDelete);
    if (index !== -1) {
        setFeatureTags([
            ...featureTags.slice(0, index),
            ...featureTags.slice(index + 1)
        ]);
    }
};

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionObject(prevCollection => {
            if (prevCollection) {
                return {
                    ...prevCollection,
                    name: event.target.value
                };
            }
            return prevCollection;
        });
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionObject(prevCollection => {
            if (prevCollection) {
                return {
                    ...prevCollection,
                    image_url: event.target.value
                };
            }
            return prevCollection;
        });
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCollectionObject(prevCollection => {
            if (prevCollection) {
                return {
                    ...prevCollection,
                    description: event.target.value
                };
            }
            return prevCollection;
        });
    };
    
    return (
        <>
        <Header />
        <div className="w-full">
          <div className="flex items-center justify-between">
            <h2 className="px-16 py-8 font-manrope font-bold text-4xl text-center">
              Create New Collection
            </h2>
          </div>
        </div>

        {/* Upload Collection Form */}
        <div className="flex flex-col mb-20 lg:ml-40 md:ml-20 sm:ml-10 ml-5 justify-center w-3/4 2xl:w-1/2 bg-slate-100 dark:bg-neutral p-10"
            style={{borderRadius: 30}}>

            {/* Collection Name */}
            <div className="flex flex-col justify-center">
                <label htmlFor="collectionName" className=" font-semibold text-lg">Collection Name</label>
                <div className="relative w-full">
                    <input type="text" defaultValue={collectionName} onChange={handleNameChange} id="collectionName" className="w-full h-12 mt-2 border-2 border-gray-300 rounded-md px-4" />
                    <FaPencil className="absolute right-5 top-1/2 transform -translate-y-1/4"/>
                </div>
            </div>
            
            {/* Upload Image */}
            <div className="flex flex-col justify-center mt-6">
                <p className="font-semibold text-lg">Collection Cover Image</p>
                <label htmlFor="uploadFile1"
                    className="bg-white dark:bg-slate-300 mt-2 text-gray-500 font-semibold text-lg rounded h-52 w-96 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed font-[sans-serif]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-11 mb-2 fill-gray-500" viewBox="0 0 32 32">
                        <path
                        d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                        data-original="#000000" />
                        <path
                        d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                        data-original="#000000" />
                    </svg>
                        Upload image
                    <input type="file" accept="image/*" id='uploadFile1' className="hidden" />
                    <p className="text-xs font-medium text-gray-400 mt-2">PNG, JPG SVG, WEBP, and GIF are Allowed.</p>
                </label>
            </div>
            
            {/* Description */}
            <div className="flex flex-col justify-center mt-6">
                <label htmlFor="collectionDescription" className=" font-semibold text-lg">Collection Description</label>
                <textarea onChange={handleDescriptionChange} placeholder="Tell us about your collection..." id="collectionDescription" className="w-full h-32 mt-2 border-2 border-gray-300 rounded-md px-4 py-2" />
            </div>

            {/* Features */}
            <div className="flex flex-col justify-center mt-8">
                <div className="flex">
                    <label htmlFor="collectionDescription" className=" font-semibold text-lg">Describe this collection's items</label>

                    {/* Info Button */}
                    <button className="btn btn-xs rounded-full my-1 mx-2 border-zinc-950" onClick={openModal}><FaInfo /></button>
                </div>
                
                {/* Info Modal */}
                <dialog id="my_modal_3" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Item attribute</h3>
                        <p className="py-4">These attribute tags refer to what you would like to view, sort, and search the items in this collection by.</p>
                    </div>
                </dialog>

                <input type="text" onKeyDown={handleEnterPress} placeholder="Add at least one attribute (Name, Color, Year etc.)" id="collectionName" className="w-full h-12 mt-2 border-2 border-gray-300 rounded-md px-4" />
            </div>
            <div className="flex flex-wrap mt-2">
                {featureTags.map((tag, index) => (
                    <div key={index} className="flex items-center bg-primary text-gray-600 font-semibold text-lg rounded-md pl-4 pr-2 py-1 mr-3 mt-2">
                        {tag}
                        <button className="pl-4 " onClick={() => deleteFeatureTag(tag)}><IoMdClose /></button>
                    </div>
                ))}
            </div>

            {/* Dropdown Button */}
            <div className="flex justify-end mt-6">
                <button className="btn btn-primary my-1 text-lg hover:btn-primary"
                        style={{
                                    borderBottomRightRadius: 0,
                                    borderTopRightRadius: 0,
                                    }}>Continue</button>
                <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-primary my-1 text-lg rounded-l-lg hover:btn-primary"
                    style={{
                            borderBottomLeftRadius: 0,
                            borderTopLeftRadius: 0,
                            }}><LuChevronDownSquare /></div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-1 shadow hover:bg-base-300">
                    <li><a className="text-base">Save as draft</a></li>
                </ul>
                </div>
            </div>     
              
        </div>
        <Footer />
        </>
    )
}

export default NewCollectionForm;