import React, { useRef, useState, useEffect } from 'react';
import {LuUser , LuUpload , LuTrash } from "react-icons/lu";
const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Update the image state (passed from parent props)
      setImage(file);

      // Generate preview URL from the file
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    // Reset the file input so the same file can be selected again if needed
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  // Cleanup the object URL when the component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return <div className="flex justify-center mb-6">
        <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleImageChange}
            className="hidden"
        />
        {!image ?(
            <div className="w-20 h-20 flex justify-center items-center bg-purple-100 rounded-full relative">
                <LuUser className=" text-4xl text-primary "/>
                <button 
                    type='button'
                    className='w-8 h-8 flex items-center justify-center bg-primary rounded-full absolute bottom-1 right-1'
                    onClick={onChooseFile}
                    >
                        <LuUpload/>
                    </button>
            </div>):(
                <div className="relative">
                    <img
                        src={previewUrl}
                        alt="Profile Preview"
                        className="w-20 h-20 rounded-full object-cover"
                        />
                        <button
                            type='button'
                            className='w-8 h-8 flex items-center justify-center bg-red-500 rounded-full absolute -bottom-1 -right-1 text-white'
                            onClick={handleRemoveImage}
                            >
                                <LuTrash/>
                            </button>
                            </div>

            )
        }

    </div>
};

export default ProfilePhotoSelector;