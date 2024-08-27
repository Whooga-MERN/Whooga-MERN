import { Link } from "react-router-dom";
import { GiPostStamp } from "react-icons/gi";
import { BsCoin } from "react-icons/bs";
import { TbHorseToy, TbLego } from "react-icons/tb";
import { TbPhotoScan, TbJewishStar } from "react-icons/tb";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { GiCardExchange } from "react-icons/gi";
import {
  MdOutlinePhonelink,
  MdOutlineNotificationsActive,
} from "react-icons/md";

export default function home() {
  return (
    <>
      {/* TOP */}
      <div className="relative">
        {/* Bg */}
        {/* <div className="flex flex-col items-center justify-between">
          <div className="relative w-full ">
            <div className="absolute -z-10 w-full">
              <img
                src="/bg.jpg"
                alt="background"
                className="w-full h-full opacity-60"
                width={1000}
                height={1000}
              ></img>
            </div>
          </div>
        </div> */}

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-28 pb-16 md:pt-40 md:pb-20">
            {/* Hero content */}
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-6xl md:text-7xl lg:text-8xl text-black mb-8 font-semibold text-opacity-85">
                Take Control of Your Collection
              </p>
              <div>
                <Link
                  className="btn inline-flex items-center text-white bg-yellow-400 hover:bg-yellow-500 group"
                  to="/signup"
                >
                  Get Started
                  <span className="tracking-normal text-yellow-800 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-2">
                    <svg
                      className="fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="8"
                    >
                      <path d="m10.865.013.747.148c.243.065.481.143.716.235.495.18.97.42 1.415.716.265.192.571.343.858.55.096.064.192.135.288.209l.196.154.192.178c.09.08.175.168.254.262.189.21.33.466.414.747.076.275.073.568-.008.84-.09.27-.236.513-.427.708-.096.1-.198.191-.306.274l-.152.117-.116.074c-.369.252-.75.482-1.14.69-.577.315-1.153.585-1.701.932-.408.262-.803.549-1.182.86-.083.064-.16.136-.247.193a.918.918 0 0 1-.113.072.644.644 0 0 1-.118.016.708.708 0 0 1-.191.01.559.559 0 0 1-.246-.088l-.072-.054a1.481 1.481 0 0 1-.141-.107c-.128-.122-.1-.377.05-.726.036-.08.079-.156.128-.226l.316-.401c.164-.188.336-.372.514-.543.178-.17.356-.342.546-.493.19-.152.394-.265.59-.39.53-.329 1.05-.626 1.552-.93-.159.018-.32.034-.48.04-.511.036-1.026.044-1.546.048a43.432 43.432 0 0 1-2.31-.058l-.005-.02a78.728 78.728 0 0 0-2.292-.148c-.279-.016-.558.01-.837-.006L4.543 3.81l-.977-.046a19.357 19.357 0 0 1-.49-.029 12.6 12.6 0 0 0-1.303.013l-.828.055-.406.021H.335l-.18.008c-.145 0-.208-.15-.102-.356.16-.268.422-.46.723-.531.57-.117 1.144-.205 1.72-.264.287-.026.576-.048.865-.053.29-.004.578.01.865.042.69.065 1.408-.015 2.113-.015.776.003 1.549.02 2.324.04l1.428.039 1.087.039c.359.012.716.02 1.075.013.442-.008.879-.065 1.318-.112a3.672 3.672 0 0 0-.186-.166 9.045 9.045 0 0 0-1.06-.762 9.82 9.82 0 0 0-1.034-.537 5.9 5.9 0 0 1-1.284-.854c-.12-.115-.053-.199.12-.26a1.55 1.55 0 0 1 .738-.083Z" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* TOP END */}

      {/* FEATURES */}
      <div className="sm:py-20 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-12 md:py-20">
            {/* Section header */}
            <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
              <h1 className="h1 text-5xl font-cabinet-grotesk text-black font-semibold underline decoration-yellow-400">
                Collect Without Limit
              </h1>
            </div>

            <div className="max-w-sm mx-auto grid gap-12 sm:grid-cols-2 sm:max-w-3xl lg:grid-cols-4 lg:max-w-none items-start">
              {/* #1 */}
              <div className="text-center">
                <div className="w-9 h-9 bg-gray-900 border-2 border-white text-white text-[25px] font-bold rounded-full inline-flex items-center justify-center mb-3">
                  <GiPostStamp />
                </div>
                <h3 className="font-cabinet-grotesk font-bold text-lg">
                  All-in-one Application
                </h3>
                <div className="text-gray-500 lg:text-black">
                  Application for all kinds of collectors. Free Your brain and
                  left the work to us.
                </div>
              </div>

              {/* #2 */}
              <div className="text-center">
                <div className="w-9 h-9 bg-gray-900 border-2 border-white text-white text-[25px] font-bold rounded-full inline-flex items-center justify-center mb-3">
                  <BsCoin />
                </div>
                <h3 className="font-cabinet-grotesk font-bold text-lg">
                  Upload Your Collections
                </h3>
                <div className="text-gray-500 lg:text-black">
                  Simply use your phone to scan your new Collectibles.
                </div>
              </div>

              {/* #3 */}
              <div className="text-center">
                <div className="w-9 h-9 bg-gray-900 border-2 border-white text-white text-[25px] font-bold rounded-full inline-flex items-center justify-center mb-3">
                  <TbHorseToy />
                </div>
                <h3 className="font-cabinet-grotesk font-bold text-lg">
                  Details in Hand
                </h3>
                <div className="text-gray-500 lg:text-black">
                  We will keep all the details of every collecibles for you.
                </div>
              </div>

              {/* #4 */}
              <div className="text-center">
                <div className="w-9 h-9 bg-gray-900 border-2 border-white text-white text-[25px] font-bold rounded-full inline-flex items-center justify-center mb-3">
                  <TbLego />
                </div>
                <h3 className="font-cabinet-grotesk font-bold text-lg">
                  Save in Wish List
                </h3>
                <div className="text-gray-500 lg:text-black">
                  Find your missing collectible and save it in the wish-list.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* FEATURES END */}

      {/* DETAIL */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-10 md:py-18">
          {/* Section content */}
          <div className="max-w-xl mx-auto md:max-w-none flex flex-col md:flex-row md:space-x-8 lg:space-x-16 xl:space-x-20 space-y-8 space-y-reverse md:space-y-0">
            {/* keep collection in hand */}
            <div className="md:w-7/12 lg:w-1/2 order-1 md:order-none">
              <div className="">
                <h1 className="pb-10 font-cabinet-grotesk text-6xl font-extrabold mb-3">
                  Keep your collection in hand
                </h1>
                <ul className="inline-flex flex-col space-y-6">
                  <li className="flex items-start">
                    <div className="w-3 h-3 fill-current text-blue-500 mt-1.5 mr-3 shrink-0 text-6xl pr-3">
                      <TbPhotoScan />
                    </div>
                    <div className="ml-9 pl-9">
                      <div className="font-cabinet-grotesk font-bold text-lg mb-1">
                        Scan Collectibles With Phone
                      </div>
                      <div className="text-gray-500">
                        Make your life easier by adding collectibles with just a
                        simple sacn on phone.
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="w-3 h-3 fill-current text-blue-500 mt-1.5 mr-3 shrink-0 text-6xl pr-3">
                      <MdOutlinePhonelink />
                    </div>
                    <div className="ml-9 pl-9">
                      <div className="font-cabinet-grotesk font-bold text-lg mb-1">
                        View Your Collections Everywhere
                      </div>
                      <div className="text-gray-500">
                        Check your collections and details for each collectibles
                        anytime, anywhere on phone or website
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="w-3 h-3 fill-current text-blue-500 mt-1.5 mr-3 shrink-0 text-6xl pr-3">
                      <MdOutlineNotificationsActive />
                    </div>
                    <div className="ml-9 pl-9">
                      <div className="font-cabinet-grotesk font-bold text-lg mb-1">
                        Get Notification
                      </div>
                      <div className="text-gray-500">
                        Receive notification when your wishing collectibles on
                        Wishlist is available online.
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Image */}
            <div className="">
              <img
                className="w-full h-full mx-auto md:max-w-none"
                src="/scan.jpg"
                width={540}
                height={300}
                alt="Features"
              />
            </div>
          </div>
        </div>

        <div className="py-10 md:py-18">
          {/* Section content */}
          <div className="max-w-xl mx-auto md:max-w-none flex flex-col md:flex-row md:space-x-8 lg:space-x-16 xl:space-x-20 space-y-8 space-y-reverse md:space-y-0">
            {/* Image */}
            <div className="">
              <img
                className="w-full h-full mx-auto md:max-w-none"
                src="/deliver.jpg"
                width={540}
                height={300}
                alt="Features"
              />
            </div>

            {/* get excited */}
            <div className="md:w-7/12 lg:w-1/2 order-1 md:order-none">
              <div className="">
                <h1 className="pt-10 font-cabinet-grotesk text-6xl font-extrabold mb-3 mr-auto">
                  Get Excited for Your New Collectibles
                </h1>
                <ul className="inline-flex flex-col space-y-6">
                  <li className="flex items-start pt-8">
                    <div className="w-3 h-3 fill-current text-blue-500 mt-1.5 mr-3 shrink-0 text-6xl pr-3">
                      <TbJewishStar />
                    </div>
                    <div className="ml-9 pl-9">
                      <div className="font-cabinet-grotesk font-bold text-lg mb-1">
                        Save in Wishlist
                      </div>
                      <div className="text-gray-500">
                        Search and save your missing collectibles with one click
                        on your device.
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="w-3 h-3 fill-current text-blue-500 mt-1.5 mr-3 shrink-0 text-6xl pr-3">
                      <HiOutlineShoppingCart />
                    </div>
                    <div className="ml-9 pl-9">
                      <div className="font-cabinet-grotesk font-bold text-lg mb-1">
                        Buy What Your Are Waiting For
                      </div>
                      <div className="text-gray-500">
                        Once your wishing item becomes available, we will direct
                        you to get the item.
                      </div>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="w-3 h-3 fill-current text-blue-500 mt-1.5 mr-3 shrink-0 text-6xl pr-3">
                      <GiCardExchange />
                    </div>
                    <div className="ml-9 pl-9">
                      <div className="font-cabinet-grotesk font-bold text-lg mb-1">
                        Trade With Others
                      </div>
                      <div className="text-gray-500">
                        You can also trade with other collectors instead of
                        buying them online.
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* DETAIL END */}
    </>
  );
}
