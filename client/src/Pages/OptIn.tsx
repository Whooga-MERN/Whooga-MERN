import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function OptIn() {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();


    // privacyPolicyAccepted && termsAccepted
    if (privacyPolicyAccepted) {
      // Send the preferences to the server if necessary
      // Redirect to the main app or profile page after opting in
      navigate("/collections");
    } else {
      alert("Please accept the privacy policy to continue.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#fcc050] px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">
          Complete Your Setup
        </h2>
        <p className="text-md text-gray-600 mb-4 text-center">
          Choose your preferences before you continue to WHOOGA.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-md font-semibold text-gray-800">
              Opt-in for Email Notifications
            </label>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`rounded-md px-4 py-2 font-semibold ${
                emailNotifications
                  ? "bg-yellow-300 text-black hover:bg-yellow-400"
                  : "bg-gray-300 text-black hover:bg-gray-400"
              } transition`}
            >
              {emailNotifications ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Privacy Policy Checkbox */}
          <div className="flex items-start">
            <input
              id="privacyPolicy"
              type="checkbox"
              checked={privacyPolicyAccepted}
              onChange={() => setPrivacyPolicyAccepted(!privacyPolicyAccepted)}
              className="h-4 w-4 mt-1 text-yellow-300 border-gray-300 rounded focus:ring-yellow-400"
            />
            <label htmlFor="privacyPolicy" className="ml-3 text-sm text-gray-600">
              I have read and agree to the{" "}
              <Link
                to="/privacypolicy"
                className="font-semibold text-yellow-700 hover:underline"
              >
                Privacy Policy
              </Link>.
            </label>
          </div>

          {/* Terms of Service Checkbox
          <div className="flex items-start">
            <input
              id="termsService"
              type="checkbox"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
              className="h-4 w-4 mt-1 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
            />
            <label htmlFor="termsService" className="ml-3 text-sm text-gray-600">
              I accept the{" "}
              <Link
                to="/terms-of-service"
                className="font-semibold text-yellow-700 hover:underline"
              >
                Terms of Service
              </Link>.
            </label>
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-yellow-300 px-5 py-2 text-lg font-semibold text-black shadow-sm hover:bg-yellow-400"
          >
            Continue to WHOOGA
          </button>
        </form>
      </div>
    </div>
  );
}
