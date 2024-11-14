import Header from "../Components/Header";
import { useEffect, useState } from "react";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import { buildPath } from "../utils/utils";
import fetchJWT from "../fetchJWT";


export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [JWT, setJWT] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false); // Track dark mode state
  const [isEmailNotifications, setIsEmailNotifications] = useState(false); // Email notifications toggle
  const [name, setName] = useState(""); // Fetch current user name
  const [userId, setUserId] = useState<number | null>(null); // User ID from backend
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
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

    const theme = localStorage.getItem('theme');
    if (theme) {
      setIsDarkMode(theme === 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    }

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

        const data = await response.json();
        if (data.length > 0) {
          setUserId(data[0].user_id);
          setIsEmailNotifications(data[0].notification_opt_in); // Set button state to current DB value
          setName(data[0].name);
        }
      }
    };
    fetchData();
  }, [user, JWT]);

  useEffect(() => {
    handleProfilePic();
  }, [imageFile]);


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
      const response = await fetch(buildPath(`user/update-opt-in`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT}`
          },
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
      console.log("Updating username");
      const response = await fetch(buildPath(`user/update-username`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT}`
        },
        body: JSON.stringify({ id: userId, name })
      });

      if (response.ok) {
        console.log("Profile Updated", { name });
        alert("Profile username updated successfully");
        console.log("hello");
      } else {
        console.error("Failed to update username");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Function to handle account deletion
  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? There is no way to recover your account if you do this")) {
      const request = {
        userEmail: user.loginId,
        userId: userId
      };
      console.log("Request: ", request);

      try {
        const response = await fetch(
          buildPath(`user/delete-user`),
          {
            method: "DELETE",
            body: JSON.stringify(request),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT}`,
            },
          }
        );

        if (response.ok) {
          console.log("Item deleted successfully");
          localStorage.clear();
          window.location.pathname = '';
        } else {
          console.error("Error deleting item:", response);
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    } else {
      return;
    }
  };

  const handleProfilePic = async () => {

    const request = new FormData();
    if (userId) {
      request.append("userId", userId.toString());
    } else {
      console.error("userId is undefined");
      return;
    }

    if(imageFile) {
      request.append("profileImage", imageFile);
    } else {
      console.error("userId is undefined");
      return;
    }
    try {
      const response = await fetch(buildPath(`user/update-profile-pic`), {
        method: "PUT",
        body: request,
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      });
  
      if(response.ok) {
        console.log("Form submitted successfully");
        alert("Successfully updated profile picture");
        window.location.reload();
      } else {
        console.error("Error submitted form: ", response);
      }
    } catch (error) {
      console.error("Error submitting form: ", error);
    }
  }; 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <>
      <Header />

      <div className="mx-auto max-w-7xl pt-16 lg:flex lg:gap-x-16 lg:px-8">
        <main className="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-8 lg:mx-0 lg:max-w-none">
            {/* Profile Section */}
            <div>
              <h2 className="text-3xl font-extrabold leading-7 dark:text-gray-200">Profile</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="flex items-center justify-between mt-5">
                  <div className="flex flex-grow flex-col">
                    <h2 className="text-2xl font-extrabold leading-7">
                      Name
                    </h2>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-1/2 rounded-md border-gray-300 shadow-sm text-black"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-1/3 mt-5 rounded-md bg-yellow-300 px-5 py-2 font-semibold text-black shadow-sm hover:bg-yellow-500"
                  >
                    Update User Name
                  </button>
                </div>
              </form>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <span className="flex flex-grow flex-col">
                <span className="text-2xl font-extrabold leading-7">
                  Profile Picture
                </span>
                <span className="mt-1 text-md leading-6 text-gray-500">
                  Change your profile.
                </span>
              </span>
              <div className="w-1/3  rounded-md bg-yellow-300 px-4 py-2 text-black font-semibold hover:bg-yellow-500 transition"
              >
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer flex items-center justify-center rounded-md bg-yellow-300 text-black font-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:bg-yellow-500"                >
                  <span>Upload a photo</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>

              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex flex-grow flex-col">
                <span className="text-2xl font-extrabold leading-7">
                  Email Notifications
                </span>
                <span className="mt-1 text-md leading-6 text-gray-500">
                  Receive notifications via email.
                </span>
              </span>
              <button
                onClick={toggleEmailNotifications}
                className={`w-1/3 rounded-md px-4 py-2 font-semibold ${isEmailNotifications
                  ? "bg-yellow-300 text-black"
                  : "bg-gray-300 text-black"
                  } hover:bg-yellow-500 transition`}
              >
                {isEmailNotifications ? "Enabled" : "Disabled"}
              </button>
            </div>
            {/* Theme Preferences */}
            <div>
              <div className="flex items-center justify-between">
                <span className="flex flex-grow flex-col">
                  <span className="text-2xl font-extrabold leading-7">
                    Theme Preferences
                  </span>
                  <span className="mt-1 text-md leading-6 text-gray-500">
                    Switch between light and dark mode.
                  </span>
                </span>
                <button
                  onClick={toggleDarkMode}
                  data-toggle-theme="light,dark"
                  data-act-class="ACTIVECLASS"
                  className="w-1/3  rounded-md bg-yellow-300 px-4 py-2 text-black font-semibold hover:bg-yellow-500 transition"
                >
                  {isDarkMode ? "Dark Mode Toggle" : "Dark Mode Toggle"}
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between">
              <span className="flex flex-grow flex-col">
                <h2 className="text-2xl font-extrabold leading-7">
                  Delete Account
                </h2>
                <p className="mt-1 text-md leading-6 text-gray-500">
                  No longer collecting? Delete your account here. <br></br>This action is
                  permanent and cannot be undone.
                </p>
              </span>
              <button
                onClick={handleDeleteAccount}
                className="w-1/3 mt-5 rounded-md bg-red-500 px-5 py-2 font-semibold text-white shadow-sm hover:bg-red-600"
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
