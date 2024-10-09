import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { themeChange } from "theme-change";
import { Authenticator } from "@aws-amplify/ui-react";

// On the Logged in page
function Header() {
  const navigate = useNavigate();

  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
  }, []);

  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="navbar bg-primary">
          <div className="flex-1">
            <Link
              to="/collections"
              className="pl-3 text-black font-bold text-2xl"
            >
              Whooga!
            </Link>
          </div>
          <div className="flex-none gap-2">
            <div className="form-control">
              {/* <label className="input input-bordered flex items-center gap-2">
                <input
                  type="text"
                  className="grow w-60"
                  placeholder="Search Items and Collections"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </label> */}
            </div>
            <ul className="menu menu-horizontal px-1">
              <li>
                <button
                  data-toggle-theme="light,dark"
                  data-act-class="ACTIVECLASS"
                >dark mode</button>
              </li>
              <li>
                <Link
                  to="/collections"
                  className="text-black hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
                >
                  My Collections
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-black hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
                >
                  Wishlist
                </Link>
              </li>
            </ul>

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar border-black"
              >
                <div className="w-10 rounded-full">
                  <img alt="profile pic" src="/profilepic.jpeg" />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link to="/profile" className="justify-between">
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={async () => {
                      if (signOut) {
                        signOut();
                        navigate("/"); // Redirect to the home page
                      }
                    }}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Authenticator>
  );
}

export default Header;
