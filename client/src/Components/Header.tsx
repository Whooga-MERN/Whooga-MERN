import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { themeChange } from "theme-change";
import { Authenticator } from "@aws-amplify/ui-react";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import fetchJWT from "../fetchJWT";
import { buildPath } from "../utils/utils";

// On the Logged in page
function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [JWT, setJWT] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
    const fetchUserDetails = async () => {
      try {
        const fetchUser = await fetchUserLoginDetails();
        console.log("fetchUser: ", fetchUser);
        setUser(fetchUser || "");
      } catch (error) {
        console.error("Error Fetching User");
      }
    }

    const fetchToken = async () => {
      try {
        const token = await fetchJWT();
        setJWT(token || "");
      } catch (error) {
        console.error("Error fetching JWT");
      }
    };

    fetchUserDetails();
    fetchToken();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.loginId) {
        console.log("user: ", user);
        console.log("user.loginId ", user.loginId);
        const response = await fetch(
          buildPath(`user/?user_email=${user.loginId}`), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT}`,
          },
        }
        );
        //coin.png
        const data = await response.json();
        console.log(data);
        if (data.length > 0) {
          console.log("setting imageUrl");
          console.log(data[0].user_profile_pic);
          setImageUrl(data[0].user_profile_pic);
        }
      }
    };
    fetchData();
  }, [user, JWT])

  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="navbar bg-primary">
          <div className="flex-1">
            <Link
              to="/collections"
              className="pl-3 text-black font-bold text-2xl"
            >
              WHOOGA!
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
                  <img alt="profile pic" src={imageUrl || "/coin.png"} />
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
