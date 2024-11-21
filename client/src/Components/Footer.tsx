import { Link } from 'react-router-dom';

export default function Footer(): JSX.Element {
  return (
    <footer className="w-full relative  dark:text-white">
      <div className="container p-5 mx-auto">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">WHOOGA!</span>
          <div className="flex space-x-4 text-xl font-bold">
            <Link to="/privacypolicy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link to="/contactus" className="hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright section */}
      <hr className="border-gray-700" />
      <div className="p-3 text-center">
        © 2024 WHOOGA! All rights reserved.
      </div>
    </footer>
  );
}