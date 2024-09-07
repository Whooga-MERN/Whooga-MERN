import { IoMdAddCircleOutline } from "react-icons/io";
import { IconContext } from "react-icons";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const collections = [
  {
    title: "Pathtags",
    id: 1,
    image: "/bear.jpg",
    newListing: true,
  },
  {
    title: "Shoes",
    id: 2,
    image: "/jordans.jpg",
    newListing: false,
  },
  {
    title: "Snowglobes",
    id: 3,
    image: "/snowglobe.jpg",
    newListing: true,
  },
  {
    title: "ur mom",
    id: 4,
    image: "/psycho.jpg",
    newListing: false,
  },
  {
    title: "ur mom",
    id: 5,
    image: "/scan.jpg",
    newListing: true,
  },
  {
    title: "ur mom",
    id: 6,
    image: "/psycho.jpg",
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
        <div className="w-full bg-white">
          <div className="flex items-center justify-between">
            <h2 className="px-20 font-manrope font-bold text-4xl text-black text-center">
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
                    <button className="btn btn-primary text-2xl w-250 ">New Collection
                      <IoMdAddCircleOutline />
                    </button>
                    </IconContext.Provider>
                </div>
            </div>
          </div>
        </div>

        {/* collectibles */}
          <div className="w-full px-32">
            <div className="mt-8 grid lg:grid-cols-4 gap-10 md:grid-cols-4 sm:grid-cols-2">
              {collections.map((collection) => (
                <div key={collection.id}>
                  <div className="card card-compact card-bordered bg-base-100 h-100 w-200 hover:shadow-xl cursor-pointer" onClick={handleClick}>
                    <div style={{
                      right: '3%',
                      bottom: '97%',
                      position: 'absolute',
                      }}>
                      {collection.newListing ? <div className="badge badge-lg badge-primary">WHOOGA!</div> : ''}
                    </div>
                    <figure style={{aspectRatio: '1 / 1'}}>
                      <img
                        className="object-cover w-full h-full rounded-t-lg border-b-2"
                        style={{ height: '100%', width: '100%', aspectRatio: '1 / 1'}}
                        src={collection.image}
                        alt={collection.title} />
                    </figure>
                    <div className="card-body">
                      <h2 className="card-title">
                        {collection.title}
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