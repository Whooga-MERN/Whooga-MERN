import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegUserCircle, FaRegEye } from "react-icons/fa";
import { signIn } from 'aws-amplify/auth';  // Import signIn directly

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Sign-in handler
  const handleSignIn = async () => {
    try {
      await signIn({
        username,
        password,
      });
      navigate("/home");  // Navigate to the home page after a successful sign-in
    } catch (error) {
      setErrorMessage("Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <>
      <div className=" gap-4 max-lg bg-[#fcc050] px-8 pt-4 pb-8">
        <Link to="/" className="text-black font-bold text-xl">
          WHOOGA!
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 bg-[#fcc050] px-56 h-[250px]">
        <div className="max-w-sm mt-16 max-lg:hidden">
          <h3 className="text-3xl font-bold text-black">Sign in</h3>
          <h3 className="text-xl font-semibold text-black pt-2">
            Welcome back!
          </h3>
          <p className="text-md mt-4 text-black">
            I still love making this website！
          </p>
        </div>

        <div className="bg-white rounded-3xl sm:px-6 px-8 py-10 max-w-md w-full h-max shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] max-lg:mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
            <div className="mb-8">
              <h2 className="text-md font-semibold text-black">
                Welcome to <span className="font-extrabold">WHOOGA!</span>
              </h2>
              <h3 className="text-4xl font-semibold text-gray-800">Sign in</h3>
            </div>

            {errorMessage && (
              <p className="text-red-500">{errorMessage}</p>
            )}

            <div className="pt-10">
              <label className="text-gray-800 text-sm mb-2 block">
                Username
              </label>
              <div className="relative flex items-center">
                <input
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full text-sm text-gray-800 border border-gray-300 px-4 py-3 rounded-md outline-yellow-400"
                  placeholder="Username"
                />
                <FaRegUserCircle className="w-5 h-5 absolute right-4 text-gray-400" />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-gray-800 text-sm mb-2 block">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-sm text-gray-800 border border-gray-300 px-4 py-3 rounded-md outline-yellow-400"
                  placeholder="Password"
                />
                <FaRegEye className="w-5 h-5 absolute right-4 text-gray-400" />
              </div>
            </div>

            <div className="mt-4 text-right">
              <Link
                to="/forgotpassword"
                className="text-yellow-700 text-sm font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full shadow-xl py-3 px-6 text-sm font-semibold rounded-md text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none"
              >
                Sign in
              </button>
            </div>
            <p className="text-sm mt-8 text-center text-gray-800">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-yellow-700 font-semibold hover:underline ml-1 whitespace-nowrap"
              >
                Register here!
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
