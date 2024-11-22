import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildPath } from "../utils/utils";
import { FaInfo } from "react-icons/fa";

function BulkUpload() {
  const [attributes, setAttributes] = useState<string[]>([]);
  const [collectionName, setCollectionName] = useState<string>("");
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collectionUniverseId, setCollectionUniverseId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const storedCustomAttributes = localStorage.getItem("customAttributes");
      const storedCollectionName = localStorage.getItem("collectionName") ?? "";
      const storedCollectionUniverseId =
        localStorage.getItem("collectionUniverseId") ?? "";
      setCollectionName(storedCollectionName);
      setCollectionUniverseId(storedCollectionUniverseId);

      try {
        const response = await fetch(
          buildPath(`collectable-attributes/masked-attributes/` + collectionId)
        );
        const data = await response.json();
        console.log("response: ", data);
        if (Array.isArray(data)) {
          setAttributes(data);
        } else {
          console.error("Unexpected response format:", data);
        }
      } catch (error) {
        console.error("Error deleting universe collectable: ", error);
      }
    };

    fetchData();
  }, []);

  const navigate = useNavigate();

  const onClickDownload = () => {
    var allTags = ["owned", "image"];
    allTags = allTags.concat(attributes);
    const csvContent = allTags.join(",");
    const blob = new Blob([csvContent], { type: "text/csv" });
    console.log("blob: ", blob);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    console.log("helo" + collectionName);
    a.download = collectionName + "_collection_template.csv";
    a.click();
  };

  const handleContinue = () => {
    navigate("/bulk-upload-step-2/" + collectionId);
  };

  const openModal = () => {
    const modal = document.getElementById(
      "my_modal_3"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <>
      <Header />
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="px-16 py-8 font-manrope font-bold text-4xl text-center">
            Bulk Upload to {collectionName}
          </h2>
        </div>
      </div>

      {/* Download Collection Form */}
      <div
        className="flex flex-col mb-20 lg:ml-40 md:ml-20 sm:ml-10 ml-5 justify-center w-3/4 2xl:w-1/2 bg-slate-100 dark:bg-neutral p-10"
        style={{ borderRadius: 30 }}
      >
        {/* Download CSV */}
        <div className="flex flex-col justify-center">
          <label htmlFor="collectionName" className=" font-semibold text-4xl">
            Step 1
          </label>

          <div className="flex items-center mt-10">
            <p className="font-semibold text-lg">
              Download your .csv template file:
            </p>
            {/* Info Button */}
            <button
              className="btn btn-xs rounded-full my-1 mx-2 border-zinc-950"
              onClick={openModal}
            >
              <FaInfo />
            </button>
          </div>

          {/* Info Modal */}
          <dialog id="my_modal_3" className="modal">
            <div className="modal-box">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <h3 className="font-bold text-lg">
                After downloading the CSV template, ensure:
              </h3>
              <ul className="list-disc pl-4">
                <li>Do not add new columns! To add new attributes go to edit collection then "Add or Remove Attributes"
                </li>
                <li>Check entries for accuracy.</li>
                <li>Match values to your collection settings.</li>
                <li>
                  Mark "T" for owned items and "F" for unowned in the "owned"
                  column.
                </li>
                <li>
                  Ensure the image URL in the CSV matches the filenames in the
                  images folder.
                </li>
              </ul>
            </div>
          </dialog>

          <div className="relative w-full pt-2 flex">
            <button
              className="btn btn-primary text-lg"
              onClick={onClickDownload}
            >
              Download template
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="btn btn-primary my-1 text-lg hover:btn-primary"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default BulkUpload;
