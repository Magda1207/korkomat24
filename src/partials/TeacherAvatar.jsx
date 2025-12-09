import { useMemo } from "react";

function TeacherAvatar({ displayStatus, status, profileImage, teacherInitial }) {

  const bgColors = [
  "bg-pink-50",
  "bg-blue-50",
  "bg-green-50",
  "bg-yellow-50",
  "bg-purple-50",
  "bg-indigo-50",
  "bg-red-50",
  "bg-teal-50",
  "bg-orange-50",
  "bg-cyan-50",
];

const randomBg = useMemo(
  () => bgColors[Math.floor(Math.random() * bgColors.length)],
  []
);


  return (
    <div className="relative">
      {profileImage ?
        <div>
          <img className="w-32 h-32  aspect-square rounded-lg" src={profileImage} alt="Photo" />
        </div> : 
        teacherInitial ? <div className={`w-32 h-32 relative inline-flex items-center justify-center overflow-hidden bg-gray-100 rounded-lg dark:bg-gray-600 ${randomBg}`}>
          <span className="font-medium text-gray-600 dark:text-gray-300">{teacherInitial}</span>
        </div> :
          <div className={`w-32 h-32 aspect-square relative overflow-hidden bg-gray-100 rounded-lg dark:bg-gray-600 ${randomBg}`}>
            <svg className="w-23 h-23 absolute text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
          </div>
      }
      {displayStatus ? status == 'active' ? 
        <span className="bottom-1 right-1 absolute  w-5 h-5 bg-green-400 border-2 border-white rounded-lg"></span> : 
        status == 'busy' ? <span className="bottom-1 right-1 absolute  w-5 h-5 bg-red-400 border-2 border-white rounded-lg"></span> : 
        <span className="bottom-1 right-1 absolute  w-5 h-5 bg-gray-300 border-2 border-white rounded-lg"></span> :
        <></>
      }
    </div>
  );
}

export default TeacherAvatar;
