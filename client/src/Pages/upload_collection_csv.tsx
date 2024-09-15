import React, { useEffect, useState } from 'react';

import Header from "../Components/Header";
import Footer from "../Components/Footer";

function UploadCollection() {

    const [featureTags, setFeatureTags] = useState<string>('');
    const [collectionName, setCollectionName] = useState<string>('');
    const [isInputEmpty, setIsInputEmpty] = useState<boolean>(false);
    const [jsonData, setJsonData] = useState<any[]>([]);
    const [fileName, setFileName] = useState<string>('');

    useEffect(() => {
        const storedFeatureTags = localStorage.getItem('featureTags');
        const storedCollectionName = localStorage.getItem('collectionName') ?? '';
        setCollectionName(storedCollectionName);
        if (storedFeatureTags) {
            setFeatureTags("owned," + storedFeatureTags);
        }
    }, []);

    const onClickDownload = () => {
        const blob = new Blob([featureTags], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        console.log("helo" + collectionName);
        a.download = collectionName + '_collection_template.csv';
        a.click();
    };

    const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            console.log('no file selected');
            setIsInputEmpty(true);
            return;
        }
        console.log('file selected:', file);
        setFileName(file.name);
        setIsInputEmpty(false);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const contents = e.target?.result as string;
            const jsonItems = CSVToJSON(contents);
            setJsonData(jsonItems);
            console.log(jsonData);
        };
        reader.readAsText(file);
    };

    const CSVToJSON = (csv: string) => { 
        const lines = csv.split('\n'); 
        const keys = lines[0].split(','); 
        return lines.slice(1).map(line => { 
            return line.split(',').reduce((acc, cur, i) => { 
                const toAdd: { [key: string]: string } = {}; 
                toAdd[keys[i]] = cur; 
                return { ...acc, ...toAdd }; 
            }, {}); 
        }); 
    };

    const handleUpload = () => {
        // Insert API call here to upload the CSV file

        // const response = await fetch('https://api.example.com/upload', {
        //     method: 'POST',
        //     body: JSON.stringify(jsonData),
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // });
        // const data = await response.json();

        // if (data.success) {
        //     navigate('/new_collection_form');
        // } else {
        //     console.error('Upload failed');
        // }

    };

    return (
        <>
            <Header />
            <div className="w-full">
                <div className="flex items-center justify-between">
                    <h2 className="px-16 py-8 font-manrope font-bold text-4xl text-center">
                    Create New Collection
                    </h2>
                </div>
            </div>

            {/* Upload Collection Form */}
            <div className="flex flex-col mb-20 lg:ml-40 md:ml-20 sm:ml-10 ml-5 justify-center w-3/4 2xl:w-1/2 bg-slate-100 dark:bg-neutral p-10"
                style={{borderRadius: 30}}>

                {/* Download CSV */}
                <div className="flex flex-col justify-center">
                    <label htmlFor="collectionName" className=" font-semibold text-lg">First, download your csv template:</label>
                    <div className="relative w-full pt-2 flex">
                        <button className="btn btn-primary text-lg" onClick={onClickDownload}>Download template</button>
                    </div>
                </div>
                
                {/* Upload CSV */}
                <div className="flex flex-col justify-center mt-10">
                    <p className="font-semibold text-lg">Next, upload your filled in file:</p>
                    <p className="text-red-500 text-md">{isInputEmpty ? '* Please upload your filled in .csv file *' : ''}</p>
                    <label htmlFor="uploadFile1"
                        className="bg-white dark:bg-slate-300 mt-2 text-gray-500 font-semibold text-lg rounded h-52 w-96 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed font-[sans-serif]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-11 mb-2 fill-gray-500" viewBox="0 0 32 32">
                            <path
                            d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                            data-original="#000000" />
                            <path
                            d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                            data-original="#000000" />
                        </svg>
                            Upload .csv file
                        <input type="file" accept=".csv" id='uploadFile1' onChange={onFileUpload} className="hidden" />
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

                {/* Upload Button */}
                    <button className="btn btn-primary mt-10 text-lg hover:btn-primary"
                            onClick={handleUpload}
                            style={{
                                        borderBottomRightRadius: 0,
                                        borderTopRightRadius: 0,
                                        }}>Upload to Collection!
                                        </button>
            </div>
            <Footer />
        </>
    );
}

export default UploadCollection;