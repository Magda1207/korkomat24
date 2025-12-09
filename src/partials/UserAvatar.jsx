import { useState, useEffect } from 'react';
import { useFetch } from '../server/common/apiCalls'


function UserAvatar({ displayStatus, size, myStatus }) {

  const [userInfo] = useFetch('api/user/info')
  const [profileImage, setProfileImage] = useState()
  const [initial, setInitial] = useState()
  const [imageSize, setImageSize] = useState("w-10 h-10")
  const [placeholderSize, setPlaceholderSize] = useState("w-14 h-14")


  useEffect(() => {
    const firstName = localStorage.getItem('firstName')
    const lastName = localStorage.getItem('lastName')
    if(firstName && lastName)
      setInitial(firstName.slice(0,1) + lastName.slice(0,1))

    if(size === "large") {
      setImageSize("w-20 h-20")
      setPlaceholderSize("w-23 h-23")
    }
    if(size === "xl") {
      setImageSize("w-full h-full")
      setPlaceholderSize("w-full h-full")
    }


    //setInitial(localStorage.getItem('username').split(' ').map((word) => word[0]).join(''))
  })

  useEffect(() => {
    if(userInfo) setProfileImage(userInfo.profileImage)
  }, [userInfo])



  return (
    <>
      {profileImage ?
        <div className="relative">
          <img className={imageSize+" rounded-xl mt-2"} src={profileImage} alt="Photo" />
        </div> : initial ? <div className={imageSize+" bg-yellow-50 relative inline-flex items-center justify-center overflow-hidden bg-gray-100 rounded-xl dark:bg-gray-600"}>
          <span className="font-medium text-gray-600 dark:text-gray-300">{initial}</span>
        </div> :
          <div className={imageSize+" relative overflow-hidden bg-gray-100 rounded-xl dark:bg-gray-600"}>
            <svg className={placeholderSize+" absolute text-gray-400 -left-1"} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
          </div>
      }
      {displayStatus ? myStatus === 'active' ? <span className="bottom-1 left-8 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span> : 
       myStatus === 'busy' ? <span className="bottom-1 left-9 absolute  w-3.5 h-3.5 bg-red-400 border-2 border-white dark:border-gray-800 rounded-full"></span> : <></> : <></>}
    </>
  );
}

export default UserAvatar;
