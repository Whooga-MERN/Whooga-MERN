import React from "react";

type propTypes = {
  isVisible: boolean;
  onClose: () => void;
};

const Modal: React.FC<propTypes> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-10
        backdrop-blur-[1px] flex justify-center items-center"
    >
      <div className="w-[600px]">
        <div className="modal-box w-11/12 max-w-5xl bg-yellow-100">
          <h3 className="font-extrabold text-2xl py-5">Tag Name</h3>
          <p className="py-4 px-4">Tag information</p>
          <p className="py-4 px-4">Tag information</p>
          <p className="py-4 px-4">Tag information</p>
          <p className="py-4 px-4">Tag information</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn bg-yellow-400" onClick={() => onClose()}>
                Close
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
