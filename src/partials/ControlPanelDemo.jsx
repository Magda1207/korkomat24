import { useState } from 'react';
import icons from './icons'

const ControlPanelDemo = () => {

  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <div>
      <div id="controlPanel" className="fixed right-0 grid grid-cols-1 m-6 mt-12 content-center z-50">
        <div className="relative w-64 bg-zumthor-100 rounded-lg shadow-xl">
          <div className={`relative flex items-center text-sm font-semibold bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 ${isMinimized ? 'rounded-lg' : 'rounded-t-lg'} `}>
            <div className="relative left-1/2 transform -translate-x-1/2">
              Mój pokój
            </div>
            <div className="absolute right-0 mr-6 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? icons.Minimize : icons.Maximize}
            </div>
          </div>
          <div id='content' className={`overflow-hidden ${isMinimized ? 'hidden' : ''} pb-4`}>
            {/* SidePanel demo*/}
            <div className="flex flex-col mx-5 select-none">
              <div className="mt-5 relative flex flex-col overflow-auto">
                <div className="grid grid-cols-2 gap-2">
                  {/* Kolumna 1: Ty */}
                  <div className="flex flex-col items-center">
                    <div className={`relative border-solid border-2 bg-gray-100' w-full aspect-square place-content-center inline rounded-xl flex flex-col items-center`}>
                      {icons.Avatar}
                    </div>
                    <span className="block mt-2 text-sm font-medium text-gray-700 text-center">
                      Julia
                    </span>
                  </div>

                  {/* Kolumna 2: Zdalny użytkownik */}
                  <div className="flex flex-col items-center">
                    <div className={`relative border-solid border-2 bg-gray-100' w-full aspect-square place-content-center inline rounded-xl flex flex-col items-center`}>
                      {icons.Avatar}
                    </div>
                    <span className="block mt-2 text-sm font-medium text-gray-700 text-center">
                      Martyna
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <button type="submit" className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600">Rozpocznij lekcję</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default ControlPanelDemo;