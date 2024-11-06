import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

import { Collection } from '../Types/Collection';

function NewCollectionSearchMatches () {
    // Add your component logic here
    const location = useLocation();
    const { searchResults } = location.state || { searchResults: [] };

    return (
        <>
            <Header />
            <div className="w-full">
                <div className="flex">
                    <h2 className="px-16 pt-14 pb-8 font-manrope font-bold text-4xl text-center">
                        We've found some matches...
                    </h2>
                </div>
            </div>
            <div className="flex">
                {/* collectibles */}
                <div className="pl-24 w-2/3">
                    <div className="mt-8 grid lg:grid-cols-3 gap-8 md:grid-cols-2 sm:grid-cols-1">
                    {searchResults.map((collection: any) => (
                        <div key={collection.collection_universe_id}>
                        <div className="card card-compact card-bordered bg-base-200 hover:shadow-2xl cursor-pointer dark:bg-base-300">
                            <figure style={{aspectRatio: '1 / 1'}}>
                            <img
                                className="object-cover w-full h-full rounded-t-lg border-b-2"
                                style={{ height: '100%', width: '100%', aspectRatio: '1 / 1'}}
                                src={collection.universe_collection_pic}
                                alt={collection.name} />
                            </figure>
                            <div className="card-body">
                            <h2 className="card-title">
                                {collection.name}
                            </h2>
                            <div className="card-actions justify-end">
                                <Link to={`/items/${collection.collection_universe_id}`} className="btn btn-primary">View Collection</Link>
                            </div>
                            </div>
                        </div>
                        </div>
                        ))}
                    </div>
                </div>
                <div >
                    <div className="flex w-1/3">
                        <div className="card dark:bg-base-300 card-bordered shadow-xl fixed xl:ml-24 lg:ml-16 md:mr-10 sm:ml-4">
                            <div className="card-body">
                                <h2 className="card-title">Not what you're looking for?</h2>
                                <div className="card-actions justify-center">
                                <Link to="/new_collection_form" className="btn btn-primary mt-2">Create new Collection</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default NewCollectionSearchMatches;