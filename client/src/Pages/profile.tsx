import Header from "../Components/Header";
import { useEffect, useState } from "react";

export default function Profile() {
  const [isDarkMode, setIsDarkMode] = useState(false); // Track dark mode state
  const [isEmailNotifications, setIsEmailNotifications] = useState(false); // Email notifications toggle
  const [name, setName] = useState("Example"); // Fetch current user name
  const [userId, setUserId] = useState<number | null>(null); // User ID from backend

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await fetch("http://localhost:3000/user?user_email=yo213976@ucf.edu");
            const data = await response.json();
            if (data.length > 0) {
                setUserId(data[0].user_id);
                setIsEmailNotifications(data[0].notification_opt_in); // Set button state to current DB value
                setName(data[0].name);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };
    fetchUserData();
}, []);


  // Function to handle dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "light" : "dark"
    );
  };

  const toggleEmailNotifications = async () => {
    if (!userId) return;

    const newStatus = !isEmailNotifications;
    setIsEmailNotifications(newStatus);

    try {
      const response = await fetch("http://localhost:3000/user/update-opt-in", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, notification_opt_in: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification preference");
      }
      console.log("Notification preference updated successfully.");
    } catch (error) {
      console.error("Error updating notification preference:", error);
    }
  };

  // Function to handle profile update (only updating name)
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    try {
      await fetch(`/user/update-name-email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, name }),
      });
      console.log("Profile Updated", { name });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Function to handle account deletion
  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      // Logic to delete the account from the backend
      console.log("Account Deleted");
    }
  };

  return (
    <>
      <Header />

      <div className="mx-auto max-w-7xl pt-16 lg:flex lg:gap-x-16 lg:px-8">
        <main className="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            {/* Profile Section */}
            <div>
              <h2 className="text-3xl font-extrabold leading-7">Profile</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-5 rounded-md bg-yellow-300 px-5 py-2 text-lg font-semibold text-black shadow-sm hover:bg-yellow-500"
                >
                  Update Profile
                </button>
              </form>
            </div>

            {/* Email Notifications */}
            <div>
              <div className="flex items-center justify-between">
                <span className="flex flex-grow flex-col">
                  <span className="text-2xl font-extrabold leading-7">
                    Email Notifications
                  </span>
                  <span className="pb-3 mt-1 text-md leading-6 text-gray-500">
                    Receive notifications via email.
                  </span>
                </span>
                <button
                  onClick={toggleEmailNotifications}
                  className={`rounded-md px-4 py-2 font-semibold ${
                    isEmailNotifications
                      ? "bg-yellow-300 text-black"
                      : "bg-gray-300 text-black"
                  } hover:bg-yellow-500 transition`}
                >
                  {isEmailNotifications ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>

            {/* Theme Preferences */}
            <div>
              <div className="flex items-center justify-between">
                <span className="flex flex-grow flex-col">
                  <span className="text-2xl font-extrabold leading-7">
                    Theme Preferences
                  </span>
                  <span className="pb-3 mt-1 text-md leading-6 text-gray-500">
                    Switch between light and dark mode.
                  </span>
                </span>
                <button
                  onClick={toggleDarkMode}
                  data-toggle-theme="light,dark"
                  data-act-class="ACTIVECLASS"
                  className="rounded-md bg-yellow-300 px-4 py-2 text-black font-semibold hover:bg-yellow-500 transition"
                >
                  {isDarkMode ? "Dark Mode On" : "Dark Mode Off"}
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div>
              <h2 className="text-2xl font-extrabold leading-7">
                Delete Account
              </h2>
              <p className="pb-5 mt-1 text-md leading-6 text-gray-500">
                No longer collecting? Delete your account here. This action is
                permanent and cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="mt-5 rounded-md bg-red-500 px-5 py-2 text-lg font-semibold text-white shadow-sm hover:bg-red-600"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
