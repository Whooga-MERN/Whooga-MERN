import React from "react";
import { IoMdClose } from "react-icons/io";
import { GoLinkExternal } from "react-icons/go";
import { Link } from "react-router-dom";


interface ModalProps {
  submitWishlistRequest: () => void;
  wishlistForm: Record<string, any>;
  itemData: Record<string, any>;
  onClose: () => void;
  isVisible: boolean;
  maskedAttributes: string[];
  handleWishlistFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Modal: React.FC<ModalProps> = ({ submitWishlistRequest, wishlistForm, isVisible, onClose, itemData, maskedAttributes, handleWishlistFormChange }) => {



  if (!isVisible) return null;

  // Collection_universe_id
  // u_collecatble_id 
  // source_attributes_string


  const attributes = itemData?.attributes || [];
  const imageUrl =
    attributes.find((attribute: any) => attribute.name === "image")?.value ||
    "/placeholder.jpg";

  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 sm:w-3/4 lg:w-[480px] max-h-screen overflow-y-auto mt-20">
      <h2 className="text-xl font-bold mb-4 dark:text-gray-300">
        Select the attributes you want us to search by
      </h2>

      <form onSubmit={submitWishlistRequest}>
        {maskedAttributes
          .concat("owned", "image")
          .filter((attr) => attr !== null)
          .map((attribute, index) => (
            <div key={index} className="mb-4 lg:max-w-lg">
              <div className="flex items-center  space-x-4">

                {
                  (attribute !== "owned" && attribute !== "image" && wishlistForm[attribute])&& (
                    <>
                      <label
                        htmlFor={attribute}
                        className="text-lg font-medium text-gray-700 dark:text-gray-300"
                      >
                        {/* <span className="text-yellow-600"><strong>{attribute}</strong></span>: (wishlistForm[attribute] === "") ? {wishlistForm[attribute]} : "N/A"
                         */}
                         <span className="text-yellow-600"><strong>{attribute}</strong></span>: {wishlistForm[attribute]["value"] !== "" ? wishlistForm[attribute]["value"] : "N/A"}
                      </label>
                      <input
                      type="checkbox"
                      id={attribute}
                      name={attribute}
                      defaultChecked={false} // Start off as unchecked
                      className="w-4 h-4 text-yellow-300 border-gray-300 rounded focus:ring focus:ring-yellow-300 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                      onChange={(e) => {handleWishlistFormChange(e)}}
                      />
                    </>
                 )
                }
           
                { (attribute === "image") && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={imageUrl}
                      alt="Item"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          
          ))}

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-xl"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default Modal;
