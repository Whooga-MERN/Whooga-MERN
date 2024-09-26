import { IoMdAddCircleOutline } from "react-icons/io";
import { IconContext } from "react-icons";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Link } from "react-router-dom";

import { Collection } from "../Types/Collection";

const collections: Collection[] = [
  {
    name: "Pathtags",
    id: 1,
    image_url: "/bear.jpg",
    description: "Pathtags are a type of geocaching swag that are small and lightweight. They are usually made of metal and have a unique design on them. Pathtags are often traded between geocachers and are a fun way to collect souvenirs from different caches.",
    newListing: true,
  },
  {
    name: "Shoes",
    id: 2,
    image_url: "/shoes.jpg",
    description: "Shoes are a type of footwear that are typically worn on the feet.",
    newListing: false,
  },
  {
    name: "Cat Mugs",
    id: 5,
    image_url: "/catmug.jpg",
    description: "ur mom",
    newListing: false,
  },
  {
    name: "Pokemon Cards",
    id: 4,
    image_url: "/pokemon.jpg",
    description: "ur mom",
    newListing: true,
  },
  {
    name: "Snowglobes",
    id: 3,
    image_url: "/snowglobe.jpg",
    description: "Snowglobes are a type of souvenir that are often sold in gift shops.",
    newListing: true,
  },
  {
    name: "ur mom",
    id: 6,
    image_url: "/psycho.jpg",
    description: "ur mom",
    newListing: false,
  },
];

function handleClick() {
  console.log("clicked");
}

export default function Collections() {
    return (
        <>
        <Header />
        <div className="w-full">
          <div className="flex items-center justify-between">
            <h2 className="px-20 font-manrope font-bold text-4xl text-center">
              My Collections
            </h2>
              <div className="flex flex-col md:flex-row md:items-center justify-right py-9">
                  <label className="input input-bordered flex items-center gap-2">
                    <input type="text" className="grow w-60" placeholder='Search "My Collections"' />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-4 w-4 opacity-70">
                      <path
                        fillRule="evenodd"
                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                        clipRule="evenodd" />
                    </svg>
                  </label>
                {/* New Button */}
                <div className="pl-20 relative sm: w-[400px] border-none ml-auto">
                  <IconContext.Provider
                    value={{ color: '#554141', size: '35px' }}>
                    <Link to="/new_collection_start" className="btn btn-primary text-2xl w-250 ">New Collection
                      <IoMdAddCircleOutline />
                    </Link>
                    </IconContext.Provider>
                </div>
            </div>
          </div>
        </div>

        {/* collectibles */}
          <div className="w-full px-32">
            <div className="mt-8 grid lg:grid-cols-5 gap-10 md:grid-cols-4 sm:grid-cols-2">
              {collections.map((collection: Collection) => (
                <div key={collection.id}>
                  <div className="card card-compact card-bordered bg-base-200 hover:shadow-2xl cursor-pointer dark:bg-base-300" onClick={handleClick}>
                    <div style={{
                      right: '3%',
                      bottom: '97%',
                      position: 'absolute',
                      }}>
                      {collection.newListing ? <div className="badge h-8 text-lg font-bold badge-primary">WHOOGA!</div> : ''}
                    </div>
                    <figure style={{aspectRatio: '1 / 1'}}>
                      <img
                        className="object-cover w-full h-full rounded-t-lg border-b-2"
                        style={{ height: '95%', width: '95%', aspectRatio: '1 / 1'}}
                        src={collection.image_url}
                        alt={collection.name} />
                    </figure>
                    <div className="card-body">
                      <h2 className="card-title">
                        {collection.name}
                      </h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        <Footer />
        </>
    );
}