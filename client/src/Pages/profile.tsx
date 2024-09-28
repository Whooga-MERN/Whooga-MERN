import Header from "../Components/Header";
import { useEffect, useState } from "react";
import { Description, Field, Label, Switch } from "@headlessui/react";
("use client");

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(false); //doesn't work

  return (
    <>
      <Header />

      <div className="mx-auto max-w-7xl pt-16 lg:flex lg:gap-x-16 lg:px-8">
        <main className="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
              <h2 className="text-2xl font-extrabold leading-7">
                Profile
              </h2>
              <p className="pb-3 mt-1 text-md leading-6 text-gray-500">
                This information will be displayed publicly so be careful what
                you share.
              </p>

              <form className="pt-5 mt-3 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
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

                <div className="sm:col-span-2 pt-2">
                  <label className="pt-5 block text-sm font-medium leading-6 text-black">
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
                  Update
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold leading-7">
                Notification preferences
              </h2>
              <p className="pb-3 mt-1 text-md leading-6 text-gray-500">
                Pick your notification preferences when collectibles on wishlist
                become available.
              </p>

              <form className="pt-5 mt-3 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
                <div className="relative flex items-start pt-2">
                  <div className="min-w-0 flex-1 text-sm leading-6">
                    <label
                      htmlFor="comments"
                      className="text-lg font-bold "
                    >
                      Text
                    </label>
                    <p id="comments-description" className="text-gray-500">
                      Notification sent through text massage.
                    </p>
                  </div>
                  <div className="ml-3 flex h-6 items-center">
                    <input
                      id="textCheck"
                      name="textCheck"
                      type="checkbox"
                      aria-describedby="textCheck"
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>
                </div>

                <div className="relative flex items-start pt-2">
                  <div className="min-w-0 flex-1 text-sm leading-6">
                    <label
                      htmlFor="comments"
                      className="text-lg font-bold"
                    >
                      Email
                    </label>
                    <p id="comments-description" className="text-gray-500">
                      Notification sent through Email.
                    </p>
                  </div>
                  <div className="ml-3 flex h-6 items-center">
                    <input
                      id="emailCheck"
                      name="emailCheck"
                      type="checkbox"
                      aria-describedby="emailCheck"
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className=" mt-5 rounded-md bg-yellow-300 px-5 py-2 text-lg font-semibold text-black shadow-sm hover:bg-yellow-400"
                >
                  Update
                </button>
              </form>
            </div>

            <div>
              <Field className="flex items-center justify-between">
                <span className="flex flex-grow flex-col">
                  <Label
                    as="span"
                    passive
                    className="text-2xl font-extrabold leading-7"
                  >
                    Theme preferences
                  </Label>
                  <Description
                    as="span"
                    className="pb-3 mt-1 text-md leading-6 text-gray-500"
                  >
                    Change the theme to dark/light of your choice.
                  </Description>
                </span>
                <Switch data-toggle-theme="light,dark"
                  data-act-class="ACTIVECLASS"
                  checked={isDarkMode}
                  onChange={setIsDarkMode}

                  className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 data-[checked]:bg-indigo-600"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
                  />
                </Switch>
              </Field>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold leading-7">
                Delete Account
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
