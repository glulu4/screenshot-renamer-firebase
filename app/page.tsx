// "use client"
// import {BlogPosts} from 'app/components/posts'
// import FileUpload from './components/FileUpload'
// import {MouseEvent, useState} from 'react';
// import {message} from "antd"; 
// // import pdf from 'pdf-parse';

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// import * as pdfjsLib from 'pdfjs-dist';

// export default function Page() {

//   const [jobDescription, setJobDescription] = useState<string>("");
//   const [coverLetter, setCoverLetter] = useState<string>("")
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   // const backendAddress: string | undefined = process.env.REACT_APP_GENERATE_COVER_LETTER_ADDRESS || "";
//   const backendAddress: string | undefined = "https://generatecoverletter-c3au5phgfq-uc.a.run.app"

//   const onSubmit = async (event: MouseEvent<HTMLButtonElement, MouseEvent>) => {
//     event.preventDefault();

    

//     try {
      
//       if ( backendAddress === ""){
//         message.error("Backend address was not loaded in properly");
//         return;
//       }

//       const formData = new FormData();
//       console.log("selectedFile: ", selectedFile);
//       console.log("jobDescription: ", jobDescription);

//       if (selectedFile && jobDescription){
//         console.log("selectedFile: ", selectedFile);
//         console.log("jobDescription: ", jobDescription);

//         console.log("extract", extractTextFromPDF(selectedFile));

//         formData.append('file', selectedFile);
//         formData.append('prompt', jobDescription);

//       } else{
//         message.error("selectedFile or jobDescription was falsy");
//         return;
//       }
      


//       const response = await fetch(
//         backendAddress,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({jobDesc: jobDescription, file: selectedFile}),
//         }
//       );

//       const reader = response.body?.getReader();
//       const decoder = new TextDecoder();

//       while (true) {
//         const {value, done} = await reader?.read() || {};
//         if (done) break;

//         const chunk = decoder.decode(value, {stream: true});
//         setCoverLetter((prev) => prev + chunk);
//       }
//     } catch (error) {
//       console.log(error);
//       // setError(String(error));
//     }
//   };
//   /**
//    * Extracts text from a PDF file and returns it as a string.
//    * @param {File} pdfFile - The PDF file to extract text from.
//    * @returns {Promise<string>} - A promise that resolves with the extracted text.
//    */
//   async function extractTextFromPDF(pdfFile: File) {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = async (event) => {
//         const arrayBuffer = event.target?.result;
//         try {
//           const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
//           let extractedText = '';

//           for (let i = 1; i <= pdf.numPages; i++) {
//             const page = await pdf.getPage(i);
//             const textContent = await page.getTextContent();
//             const pageText = textContent.items.map((item) => item.str).join(' ');
//             extractedText += pageText + '\n';
//           }

//           resolve(extractedText);
//         } catch (error) {
//           reject(error);
//         }
//       };

//       reader.onerror = (error) => reject(error);
//       reader.readAsArrayBuffer(pdfFile);
//     });
//   }

//   return (
//     <div className='flex flex-row gap-20'>
//       <section className='border-2 border-b-cyan-900'>
//         <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
//           Put job description here
//         </h1>
//         <textarea
//         value={jobDescription}
//         onChange={(e) => setJobDescription(e.target.value)}
//         >

//         </textarea>
//         <div className="my-8">
//           <FileUpload onFileSelect={setSelectedFile}/>
//         </div>
//       </section>
      
//       <section className='border-2 border-b-cyan-900'>
//         <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
//           My Portfolio
//         </h1>


//         <p dangerouslySetInnerHTML={{__html: coverLetter}}></p>
//         <div className="my-8">
//         </div>

//         <div>
//           <button className='bg-green-600' onClick={(e) => onSubmit(e)}>Make Cover letter</button>
//         </div>
//       </section>
//     </div>

//   )
// }


"use client";
import { useState, MouseEvent } from "react";
import { message } from "antd";
// import pdf.js library for handling PDF file parsing
// import * as pdfjsLib from "pdfjs-dist/webpack.mjs";
import * as pdfjsLib from "pdfjs-dist/"
// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function Page() {
  const [jobDescription, setJobDescription] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const backendAddress: string | undefined = "https://generatecoverletter-c3au5phgfq-uc.a.run.app";

  const onSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    try {
      if (!backendAddress) {
        message.error("Backend address was not loaded in properly");
        return;
      }

      if (!selectedFile || !jobDescription) {
        message.error("Please upload a file and enter a job description.");
        return;
      }

      // Extract text from PDF file before sending to backend
      const extractedText = await extractTextFromPDF(selectedFile);
      console.log("Extracted Text:", extractedText);

      const response = await fetch(backendAddress, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDesc: jobDescription, file: extractedText }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      // Read and set the response from the backend
      while (true) {
        const { value, done } = await reader?.read() || {};
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setCoverLetter((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Error processing file:", error);
    }
  };

  /**
   * Extracts text from a PDF file and returns it as a string.
   * @param {File} pdfFile - The PDF file to extract text from.
   * @returns {Promise<string>} - A promise that resolves with the extracted text.
   */
  async function extractTextFromPDF(pdfFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result;
        if (arrayBuffer == null) return
        try {
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let extractedText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            extractedText += pageText + "\n";
          }

          resolve(extractedText);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(pdfFile);
    });
  }

  return (
    <div className="flex flex-row gap-20">
      <section className="border-2 border-b-cyan-900">
        <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
          Put job description here
        </h1>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full h-24 p-2 border border-gray-300 rounded"
        ></textarea>
        <div className="my-8">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setSelectedFile(file);
            }}
          />
        </div>
      </section>

      <section className="border-2 border-b-cyan-900">
        <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
          Generated Cover Letter
        </h1>

        <p dangerouslySetInnerHTML={{ __html: coverLetter }}></p>
        <div className="my-8"></div>

        <div>
          <button className="bg-green-600 p-2 rounded text-white" onClick={(e) => onSubmit(e)}>
            Make Cover Letter
          </button>
        </div>
      </section>
    </div>
  );
}
