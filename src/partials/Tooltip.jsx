import { React } from 'react';

const Tooltip  = ({ message, placeRight, children, hidden }) => {
  if (hidden) return children;
  if (placeRight) return (
    message?
    <div className="group relative flex max-w-max flex-col items-center justify-center z-50">
      {children}
      <div className="absolute min-w-max translate-x-3/4 scale-0 transform rounded-lg px-3 py-2 text-xs font-medium transition-all duration-500 group-hover:scale-100"> 
          <div className="absolute left-0 top-1/2 -translate-y-1/2 clip-left h-2 w-4 bg-gray-800"/>
          <div className="float-left rounded bg-gray-800 p-2 text-center text-xs text-white">
            {message}
          </div>   
      </div>
    </div>
    :
    children
  )
  else return (
    message?
    <div className="group relative flex max-w-max flex-col items-center justify-center z-50">
      {children}
      <div className="absolute left-1/2 top-10 ml-auto mr-auto min-w-max -translate-x-1/2 scale-0 transform rounded-lg px-3 py-2 text-xs font-medium transition-all duration-500 group-hover:scale-100">
        <div className="flex max-w-xs flex-col items-center shadow-lg">
          <div className="clip-bottom h-2 w-4 bg-gray-800"/>
          <div className="rounded bg-gray-800 p-2 text-center text-xs text-white">
            {message}
          </div>
        </div>
      </div>
    </div>
    :
    children
  );
}

export default Tooltip;