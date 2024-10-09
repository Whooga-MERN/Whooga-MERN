import React from "react";
import { IoMdClose } from "react-icons/io";
import { GoLinkExternal } from "react-icons/go";
import { Link } from "react-router-dom";

type ModalProps = {
  attributes: string[];
  tagData: Record<string, string>;
  isVisible: boolean;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  attributes,
  tagData,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-opacity-10 backdrop-blur-[2px] flex justify-center items-center bg-gray-600">
      <div className="modal-box max-w-2xl">
        <div className="relative">
          <div className="absolute top-0 right-0">
            <Link
              className="mr-3 btn bg-yellow-400 w-fit text-2xl text-black"
              to={{
                pathname: "/details",
              }}
              state={{ attributes, tagData }} // Passing dynamic data to details
            >
              <GoLinkExternal />
            </Link>

            <button
              className="btn bg-yellow-400 w-fit text-2xl text-black"
              onClick={() => onClose()}
            >
              <IoMdClose />
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-xl sm:px-2 sm:py-2 lg:grid lg:grid-cols-2 lg:gap-x-2 lg:px-5">
          <div className="lg:max-w-lg">
            <section aria-labelledby="information-heading" className="mt-4">
              <div className="mt-8">
                <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  {attributes.slice(0, 2).map((attribute) => (
                    <p key={attribute}>{tagData[attribute]}</p>
                  ))}
                </div>

                <div className="py-3" />

                <div className="space-y-2 text-lg font-bold text-gray-500 dark:text-gray-400">
                  {attributes
                    .slice(2)
                    .filter((attribute) => attribute !== "image")
                    .map((attribute) => (
                      <p key={attribute}>
                        {attribute}: {tagData[attribute]}
                      </p>
                    ))}
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center sm:pt-10">
            <div className="mt-10 aspect-h-1 aspect-w-1 overflow-hidden rounded-lg">
              <img
                src={tagData.image}
                alt={tagData.title}
                width={400}
                height={400}
                className="rounded-md shadow-sm object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
