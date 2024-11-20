import { useEffect, useState } from "react";
import Footer from "../Components/Footer";
import Header from "../Components/Header";
import { useNavigate, useParams } from "react-router-dom";
import fetchJWT from "../fetchJWT";
import fetchUserLoginDetails from "../fetchUserLoginDetails";
import { buildPath } from "../utils/utils";
import { set } from "lodash";


const BulkUploadStep2 = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collectionName, setCollectionName] = useState<string>("");
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [collectionUniverseId, setCollectionUniverseId] = useState<string>("");
  const [isInputEmpty, setIsInputEmpty] = useState<boolean>(false);
  const [haveImages, setHaveImages] = useState<boolean>(false);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [JWT, setJWT] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await fetchJWT();
        setJWT(token || "");
      } catch (error) {
        console.error("Error fetching JWT");
      }
    };
    fetchToken();

    // user.loginId to get email
    const fetchUserDetails = async () => {
      try {
        const user = await fetchUserLoginDetails();
        setUser(user || "");
      } catch (error) {
        console.error("Error Fetching User");
      }
    };
    fetchUserDetails();

    const storedCollectionName = localStorage.getItem("collectionName") ?? "";
    const storedIsPublished = localStorage.getItem("isPublished") ?? "";
    const storedCollectionUniverseId = localStorage.getItem("collectionUniverseId") ?? "";

    setCollectionName(storedCollectionName);
    setCollectionUniverseId(storedCollectionUniverseId);
  }, []);

  const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("no file selected");
      setIsInputEmpty(true);
      return;
    }
    console.log("file selected:", file);
    setFileName(file.name);
    setIsInputEmpty(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result as string;
      const jsonItems = CSVToJSON(contents);
      setJsonData(jsonItems);
      console.log("JSON Items:", jsonItems);
    };
    reader.readAsText(file);
  };

  const handleFolderUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      setIsLoadingImages(true);
      const imageFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          imageFiles.push(file);
        }
      }
      console.log("Image Files:", imageFiles);
      setImages((prevState) => {
        console.log("Updated Images:", imageFiles);
        setIsLoadingImages(false);
        return imageFiles;
      });
    }
  };

  const CSVToJSON = (csv: string) => {
    const lines = csv.split("\n");
    const keys = lines[0].split(",");
    return lines.slice(1).map((line) => {
      return line.split(",").reduce((acc, cur, i) => {
        const toAdd: { [key: string]: string } = {};
        toAdd[keys[i].trim()] = cur.trim();
        return { ...acc, ...toAdd };
      }, {});
    });
  };

  useEffect(() => {
    console.log("CSV TO JSON: \n", jsonData);
  }, [jsonData]);

  const handleUpload = async () => {
    console.log("filename: ", fileName);
    if(!fileName) {
      alert("Please Upload a CSV File before uploading");
      return;
    }
    setIsUploading(true);
    event?.preventDefault();
    const formData = new FormData();
    if (collectionId) {
      formData.append("collectionId", collectionId);
    } else {
      console.error("Collection ID is undefined");
    }
    formData.append ("collectionUniverseId", collectionUniverseId);
    formData.append("csvJsonData", JSON.stringify(jsonData));
    formData.append("isPublished", isPublished.toString());
    images.forEach((image, index) => {
      formData.append("collectableImages", image);
    });

    logFormData(formData);

    try {
      // const response = await fetch('http://localhost:3000/upload-csv', {
      const response = await fetch(buildPath(`upload-csv/existing-universe`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
        body: formData,
      });

      if (response.ok) {
        console.log("Form submitted successfully");
        setIsUploading(false);
        navigate("/collections");
      } else {
        console.error("Form submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handlePublishChange = () => {
    setIsPublished(!isPublished);
  };
  
    const logFormData = (formData: FormData) => {
        const formDataEntries: Record<string, any> = {};
        formData.forEach((value, key) => {
        formDataEntries[key] = value;
        });
        console.log("FormData Contents:", formDataEntries);
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

      {/* Upload Collection Form */}
      <div
        className="flex flex-col mb-20 lg:ml-40 md:ml-20 sm:ml-10 ml-5 justify-center w-3/4 2xl:w-1/2 bg-slate-100 dark:bg-neutral p-10"
        style={{ borderRadius: 30 }}
      >
        {/* Download CSV */}
        <div className="flex flex-col justify-center">
          <label htmlFor="collectionName" className=" font-semibold text-4xl">
            Step 2
          </label>
        </div>

        {/* Upload CSV */}
        <div className="flex flex-col justify-center mt-8">
          <p className="font-semibold text-lg">
            Fill in and upload your .csv file:
          </p>
          <p className="text-red-500 text-md">
            {isInputEmpty ? "* Please upload your filled in .csv file *" : ""}
          </p>
          <label
            htmlFor="uploadFile1"
            className="bg-white dark:bg-slate-300 mt-2 text-gray-500 font-semibold text-lg rounded h-52 w-96 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed font-[sans-serif]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-11 mb-2 fill-gray-500"
              viewBox="0 0 32 32"
            >
              <path
                d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                data-original="#000000"
              />
              <path
                d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                data-original="#000000"
              />
            </svg>
            Upload .csv file
            <input
              type="file"
              accept=".csv"
              id="uploadFile1"
              onChange={onFileUpload}
              className="hidden"
            />
            <p className="text-xs font-medium text-gray-400 mt-2"></p>
          </label>
          {fileName && (
            <div className="mt-4">
              <p className="text-md">
                <span className="font-bold">Selected file:</span> {fileName}
              </p>
            </div>
          )}
        </div>

        {/* Upload Images */}
        <div className="flex flex-col justify-center mt-8">
          <p className="font-semibold text-lg mb-2">
            Upload a folder of your item images:
          </p>
          <input
            type="file"
            ref={(input) => {
              if (input) {
                input.setAttribute("webkitdirectory", "");
                input.setAttribute("mozdirectory", "");
              }
            }}
            onChange={handleFolderUpload}
            multiple
            accept="image/*"
          />
          {haveImages && (
            <div className="mt-4">
              <p className="text-md">
                <span className="font-bold">Images Uploaded</span> {fileName}
              </p>
            </div>
          )}
        </div>

        {/* Publish Collection */}
        <div className="flex items-center mt-6">
            
            <label
            htmlFor="publishCollection"
            className="mr-1 font-semibold text-lg"
            >
            Publish Items
            </label>
            <p className="text-gray-500 text-md mr-2">(Make these items public)</p>
            <input
            type="checkbox"
            id="publishCollection"
            checked={isPublished}
            onChange={handlePublishChange}
            className="h-5 w-5 text-primary border-gray-300 rounded"
            />
        </div>

        {/* Upload Button */}
        <button
          className="btn btn-primary mt-10 text-lg hover:btn-primary"
          onClick={handleUpload}
          disabled={isLoadingImages}
          style={{
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
          }}
        >
          {isUploading ? "Loading..." : "Upload to Collection!"}
        </button>
      </div>
      <Footer />
    </>
  );
};

export default BulkUploadStep2;