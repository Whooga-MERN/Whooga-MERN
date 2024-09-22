import React from "react";
import { IoMdClose } from "react-icons/io";
import { FaExternalLinkAlt } from "react-icons/fa";
import { GoLinkExternal } from "react-icons/go";
import { Link } from "react-router-dom";

type propTypes = {
  tagNum: string;
  tagTitle: string;
  tagDate: string;
  tagImage: string;
  isVisible: boolean;
  onClose: () => void;
};

const Modal: React.FC<propTypes> = ({
  isVisible,
  onClose,
  tagNum,
  tagTitle,
  tagDate,
  tagImage,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-10
        backdrop-blur-[2px] flex justify-center items-center bg-gray-600"
    >
      <div className="modal-box max-w-2xl">
        <div className="relative">
          <div className="absolute top-0 right-0">
            <Link
              className="mr-3 btn bg-yellow-400 w-fit text-2xl"
              to="/details"
            >
              <GoLinkExternal />
            </Link>

            <button
              className="btn bg-yellow-400 w-fit text-2xl"
              onClick={() => {
                onClose();
              }}
            >
              <IoMdClose />
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-xl sm:px-2 sm:py-2 lg:grid lg:grid-cols-2 lg:gap-x-2 lg:px-5">
          <div className="lg:max-w-lg">
            <div className="mt-20">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {tagTitle}
              </h1>
              <p className="pt-2 text-2xl font-bold">{tagNum}</p>
            </div>

            <section aria-labelledby="information-heading" className="mt-4">
              <div className="mt-8 space-y-2 text-xl font-bold text-gray-500">
                <p>Create At: {tagDate}</p>
                <p>tag Number: #12345</p>
                <p>tag Number: #12345</p>
              </div>
            </section>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center sm:pt-10">
            <div className="mt-10 aspect-h-1 aspect-w-1 overflow-hidden rounded-lg">
              <img
                src={tagImage}
                alt={tagTitle}
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
