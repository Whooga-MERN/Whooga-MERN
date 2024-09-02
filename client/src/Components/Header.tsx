import { Link } from "react-router-dom";

function Header() {
  return (
    <div className="navbar bg-primary">
      <div className="flex-1">
        <Link to="/" className="pl-3 text-black font-bold text-2xl">
          Whooga!
        </Link>
      </div>
      <div className="flex-none gap-2">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-24 md:w-auto"
          />
        </div>
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link
              to="/home"
              className="text-black hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
            >
              My Items
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
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img alt="profile pic" src="/profile.png" />
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
              <Link to="/settings">Settings</Link>
            </li>
            <li>
              <Link to="/">Logout</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Header;
