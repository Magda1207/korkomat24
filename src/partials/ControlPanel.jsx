import { useState } from 'react';
import icons from './icons'
import SidePanel from './SidePanel';

const ControlPanel = ({ socket, room, isTeacher, loggedIn, getLessonStatus }) => { 

  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <div>
      <div className="fixed right-0 grid grid-cols-1 m-6 mt-12 content-center z-40">
        <div id="controlPanel" className="w-64 bg-zumthor-100 rounded-lg shadow-xl">

          <div className={`relative flex items-center text-sm font-semibold bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 ${isMinimized ? 'rounded-lg' : 'rounded-t-lg'} `}>
            <div className="relative left-1/2 transform -translate-x-1/2">
              Mój pokój
            </div>
            <div className="absolute right-0 mr-6 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? icons.Maximize : icons.Minimize}
            </div>
          </div>
          <div id='content' className={`overflow-hidden ${isMinimized ? 'hidden' : ''} pb-4`}>
            <SidePanel socket={socket} room={room} isTeacher={isTeacher} loggedIn={loggedIn} getLessonStatus={getLessonStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;