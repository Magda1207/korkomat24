import React, { useState, useEffect } from 'react';
import { useFetch } from '../server/common/apiCalls'


function Avatar({displayStatus}) {

  // TODO: Profile photo upload to be implemented
  // Photo needs to be stored on server in <userId> folder 
  // Note: Photo needs to be in 1:1 aspect ratio otherwise it is stretched
  // const [profilePhoto, setProfilePhoto] = useState('/uploadedFiles/d4b0d0b1-ff59-11ee-a0f9-3822e21b4a70/cropped.jpg')
  
  const [userInfo] = useFetch('api/user/info')
  const [profileImage, setProfileImage] = useState()
  const [initial, setInitial] = useState()

  useEffect(() => {
    setInitial(localStorage.getItem('username').split(' ').map((word) => word[0]).join(''))
  })

  useEffect(()=>{
    setProfileImage(userInfo.profileImage)
  }, [userInfo])

  return (
    <>
      {profileImage ?
        <div className="relative">
          <img className="w-12 h-12 rounded-full" src={profileImage} alt="Photo" />
        </div> : initial ? <div className="relative inline-flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
          <span className="font-medium text-gray-600 dark:text-gray-300">{initial}</span>
        </div> :
          <div className="relative w-12 h-12 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
            <svg className="absolute w-14 h-14 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
          </div>
      }
      {displayStatus?
      <span className="bottom-1 left-9 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>:<></>}
    </>
  );
}

export default Avatar;
