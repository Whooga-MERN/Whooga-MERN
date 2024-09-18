import Header from "../Components/Header";
("use client");

export default function Profile() {
  return (
    <>
      <Header />

      <div className="mx-auto max-w-7xl pt-16 lg:flex lg:gap-x-16 lg:px-8">
        <main className="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
              <h2 className="text-2xl font-extrabold leading-7 text-gray-900">
                Profile
              </h2>
              <p className="pb-5 mt-1 text-md leading-6 text-gray-500">
                This information will be displayed publicly so be careful what
                you share.
              </p>
              {/* className="md:col-span-2" */}
              <form className="pt-5 mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
                  <div className="col-span-full flex items-center gap-x-8">
                    <img
                      alt="profile pic"
                      src={"/profilepic.jpeg"}
                      className="h-26 w-26 flex-none rounded-full bg-gray-800 object-cover"
                    />
                    <div className="pl-9 pt-80">
                      <button
                        type="button"
                        className="rounded-md px-4 py-3 w-60 text-md font-semibold text-black bg-yellow-300 shadow-sm hover:bg-yellow-400"
                      >
                        Change avatar
                      </button>
                      <p className="mt-2 text-xs leading-5 text-gray-400">
                        JPG, GIF or PNG.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 pt-5">
                  <label className="block text-sm font-medium leading-6 text-black">
                    Username
                  </label>
                  <div className="mt-2">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="   Username"
                      className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-yellow-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="block text-sm font-medium leading-6 text-black">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="emailAddress"
                      name="emailAddress"
                      type="text"
                      placeholder="   Email address"
                      className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-yellow-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className=" mt-5 rounded-md bg-yellow-300 px-5 py-2 text-lg font-semibold text-black shadow-sm hover:bg-yellow-400"
                >
                  Save
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold leading-7 text-gray-900">
                Change password
              </h2>
              <p className="pb-5 mt-1 text-md leading-6 text-gray-500">
                Update your password associated with your account.
              </p>
              {/* className="md:col-span-2" */}
              <form className="pt-5 mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                <div className="sm:col-span-2 pt-5">
                  <label className="block text-sm font-medium leading-6 text-black">
                    Current Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      placeholder="   Current password"
                      className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-yellow-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 pt-5">
                  <label className="block text-sm font-medium leading-6 text-black">
                    New Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="   New password"
                      className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-yellow-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="block text-sm font-medium leading-6 text-black">
                    Confirm Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="confirmPassord"
                      name="confirmPassord"
                      type="password"
                      placeholder="   Confirm password"
                      className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-yellow-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className=" mt-5 rounded-md bg-yellow-300 px-5 py-2 text-lg font-semibold text-black shadow-sm hover:bg-yellow-400"
                >
                  Save
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold leading-7 text-gray-900">
                delete Account
              </h2>
              <p className="pb-5 mt-1 text-md leading-6 text-gray-500">
                No longer collecting? Delete it here. All your information
                related to this account will be deleted
              </p>
              {/* className="md:col-span-2" */}
              <form className="pt-5 mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                <button
                  type="submit"
                  className=" mt-5 rounded-md bg-red-400 px-5 py-2 text-lg font-semibold text-black shadow-sm hover:bg-red-500"
                >
                  Delete my account
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
