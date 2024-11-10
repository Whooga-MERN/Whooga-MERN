import Header from "../Components/Header"
import Footer from "../Components/Footer"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildPath } from "../utils/utils";

function BulkEdit() {
    const [attributes, setAttributes] = useState<string[]>([]);
    const [collectionName, setCollectionName] = useState<string>('');
    const { collectionId } = useParams<{ collectionId: string }>();
    const [collectionUniverseId, setCollectionUniverseId] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            const storedCustomAttributes = localStorage.getItem('customAttributes');
            const storedCollectionName = localStorage.getItem('collectionName') ?? '';
            const storedCollectionUniverseId = localStorage.getItem('collectionUniverseId') ?? '';
            setCollectionName(storedCollectionName);
            setCollectionUniverseId(storedCollectionUniverseId);

            try {
                const response = await fetch(buildPath(`collectable-attributes/masked-attributes/` + collectionId));
                const data = await response.json();
                console.log("response: ", data);
                if (Array.isArray(data)) {
                    setAttributes(data);
                } else {
                    console.error("Unexpected response format:", data);
                }
            }
            catch (error) {
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
        const blob = new Blob([csvContent], { type: 'text/csv' });
        console.log("blob: ", blob);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        console.log("helo" + collectionName);
        a.download = collectionName + '_collection_template.csv';
        a.click();
    };

    const handleContinue = () => {
        navigate('/bulk-edit-step-2/' + collectionId);
    };

    return (
        <>
            <Header />
            <div className="w-full">
                <div className="flex items-center justify-between">
                    <h2 className="px-16 py-8 font-manrope font-bold text-4xl text-center">
                    Bulk Edit {collectionName} 
                    </h2>
                </div>
            </div>

            {/* Download Collection Form */}
            <div className="flex flex-col mb-20 lg:ml-40 md:ml-20 sm:ml-10 ml-5 justify-center w-3/4 2xl:w-1/2 bg-slate-100 dark:bg-neutral p-10"
                style={{borderRadius: 30}}>

                {/* Download CSV */}
                <div className="flex flex-col justify-center">
                    <label htmlFor="collectionName" className=" font-semibold text-4xl">Step 1</label>
                    <p className="font-semibold text-lg mt-10">Download your .csv template file:</p>
                    <div className="relative w-full pt-2 flex">
                        <button className="btn btn-primary text-lg" onClick={onClickDownload}>Download template</button>
                    </div>
                </div>
                
                <div className="flex justify-end mt-6">
                <button className="btn btn-primary my-1 text-lg hover:btn-primary" onClick={handleContinue}
                    >Continue</button>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default BulkEdit