import Header from "../Components/Header"
import Footer from "../Components/Footer"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildPath } from "../utils/utils";

function BulkEdit() {
    const [attributes, setAttributes] = useState<string[]>([]);
    const [collectionName, setCollectionName] = useState<string>('');
    const { universeCollectionId } = useParams<{ universeCollectionId: string }>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            const storedCollectionName = localStorage.getItem('collectionName') ?? '';
            setCollectionName(storedCollectionName);        
        };

        fetchData();

    }, [universeCollectionId]);

    const navigate = useNavigate();

    const onClickDownload = async () => {
        console.log("universeCollectionId: ", universeCollectionId);
        setIsLoading(true);
        try {
            const response = await fetch(buildPath(`universe-collectable/universe-collection/${universeCollectionId}`));
            const data = await response.json();
            console.log("response items: ", data);
            if (Array.isArray(data)) {
                var headers = ['id', 'owned', 'image', 'isPublished'];
                var csvRows = [];
                for (let i = 0; i < data[0].attributes.length; i++) {
                    if (data[0].attributes[i].name !== "image") {
                        headers.push(data[0].attributes[i].name);
                    }
                }
                console.log("headers: ", headers);
                
                for (let i = 0; i < data.length; i++) {
                    var row = [
                        data[i].universe_collectable_id,
                        data[i].owned ? "T" : "F",
                        data[i].attributes.find(
                            (attr: { name: string }) => attr.name === 'image'
                        ).value,
                        data[i].is_published ? "T" : "F"];

                    for (let j = 4; j < headers.length; j++) {
                        row.push(data[i].attributes.find(
                            (attr: { name: string }) => attr.name === headers[j]
                        ).value);
                    }
                    console.log("row: ", row);
                    csvRows.push(row);
                }

                var csvContent: string[] = [];
                csvContent.push(headers.join(","));
                csvRows.forEach(row => {
                    csvContent.push(row.join(","));
                });
                const csvString = csvContent.join("\n");
                console.log("csvContent after join: ", csvString);
                for (let i = 0; i < csvContent.length - 1; i++) {
                    csvContent[i] = csvContent[i] + "\n";
                    console.log("csvContent in loop: ", csvContent[i]);
                }
                localStorage.setItem('bulkEditOriginalCSV', JSON.stringify(csvContent));
                const blob = new Blob([csvString], { type: 'text/csv' });
                console.log("blob: ", blob);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                console.log("helo" + collectionName);
                a.download = collectionName + '_collection.csv';
                a.click();
                setIsLoading(false);

            } else {
                console.error("Unexpected response format:", data);
            }
        }
        catch (error) {
            console.error("Error getting universe collectable: ", error);
        }
    };

    const handleContinue = () => {
        navigate('/bulk-edit-step-2/' + universeCollectionId);
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
                        <button className="btn btn-primary text-lg" onClick={onClickDownload}>{isLoading ? "Loading" : "Download template"}</button>
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