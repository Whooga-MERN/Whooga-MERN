import React from "react";

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
        backdrop-blur-[1px] flex justify-center items-center"
    >
      <div className="w-[600px]">
        <div className="modal-box w-11/12 max-w-5xl bg-white">
          <>
            <h1 className="pb-3 text-3xl font-extrabold text-gray-900">
              <p>Title: {tagTitle}</p>
            </h1>
            <h1 className="pb-3 text-3xl font-extrabold text-gray-900">
              <p>Tag#: {tagNum}</p>
            </h1>
            <h1 className="pb-3 text-3xl font-extrabold text-gray-900">
              <p>Create At: {tagDate}</p>
            </h1>
            <img
              src={tagImage}
              alt={tagTitle}
              width={400}
              height={400}
              className="rounded-md shadow-sm object-cover object-top"
            />
            <div className="modal-action">
              <button
                className="btn bg-yellow-400"
                onClick={() => {
                  onClose();
                }}
              >
                Close
              </button>
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default Modal;
