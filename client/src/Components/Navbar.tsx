import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Zdog from "zdog";
// On the Logged out page
export default function Navbar() {
  const [isClick, setisClick] = useState(false);

  const toggleNav = (): void => {
    setisClick(!isClick);
  };    

  return (
    <div>
      {" "}
      {/* navbar */}
      <nav className="bg-primary h-[80px] dark:bg-primary flex-grow items-center justify-center pt-2">
        {/* <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8"> */}
        <div className="px-8"> 
          <div className="flex flex-row items-center h-16 justify-between">
            <div className="flex flex-box justify-center items-center">
              <div className="flex flex-row justify-center items-center">
                <Link to="/" className="text-black font-bold text-4xl">
                  {/* WHOOGA <span className="text-cyan-500 ml-[-5px]">!</span> */}
                  WHOOGA!
                </Link>
                <img src="https://whooga-images.s3.us-east-1.amazonaws.com/Submarine_Icon.png" alt="Website Logo" className="ml-4 mb-2 h-14"></img>
              </div>
            </div>

            {/* menu */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                <Link
                  to="/auth"
                  className="text-black hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
                >
                  Log in
                </Link>
                <Link
                  to="/auth"
                  className="text-black bg-white hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* responsive navbar */}
            <div className="md:hidden flex items-center">
              <button
                className="inline-flex items-center justify-center p-2 pr-8 rounded-md text-black
                              hover:text-orange-400 focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleNav}
              >
                {isClick ? (
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        {isClick && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/auth"
                className="block text-black hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                className="block text-black bg-white hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* navbar end */}
    </div>
  );
}
