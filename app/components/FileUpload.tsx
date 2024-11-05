// FileUpload.js
import React, { Dispatch, SetStateAction, useState } from "react";
{/* <PaperClipOutlined /> */}
const FileUpload = ({onFileSelect}: {onFileSelect: Dispatch<SetStateAction<File | null>>}) => {

  const handleFileChange = (e) => {
    e.preventDefault();

      const file = e.target.files[0];

      if ( file ){
          onFileSelect(file)
      }
    // setFile(e.target.files[0]);
  };


  return (
    // <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
    //   <button type="submit">Upload</button>
    // </form>
  );
};

export default FileUpload;
