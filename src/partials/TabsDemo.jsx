import { useState, useEffect } from 'react';
import { useFetch } from '../server/common/apiCalls'
import axios from 'axios';

const TabsDemo = ({ socket, getActiveTab, canvasWidth }) => {
  const [activeTab, setActiveTab] = useState();

  // Only one tab is displayed in demo version
  const tabs = ["1"];



  return (
    <div
      className="flex flex-wrap bg-light-blue"
      style={{ width: canvasWidth}}
    >
      {tabs?.map((tabId, i) => (
        <div
          key={tabId}
          className={`relative flex items-center tab rounded-t-lg text-sm font-medium leading-none cursor-pointer text-gray-600 border-t pt-3 px-4 ${activeTab === tabId ? "bg-white" : "bg-zumthor-100"}`}
          onClick={e => selectTab(e, i)}
          style={{ minWidth: 24, maxWidth: 180, margin: '1px 1px 0 0' }}
        >
          <span className="truncate pr-2 pb-3">{tabId}</span>
          {tabs.length > 1 && (
            <button
              type="button"
              onClick={e => closeTab(e, i)}
              className="absolute mt-1 right-1 top-1/4 -translate-y-1/2 w-4 h-4 p-1 flex items-center justify-center rounded-full border border-transparent hover:border-gray-400 hover:bg-gray-200 transition"
              tabIndex={-1}
              aria-label="Zamknij kartę"
              title="Zamknij kartę"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" className="text-gray-700 hover:text-gray-900 pointer-events-none">
                <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <p id="newTab"
        className="flex items-center justify-center bg-zumthor-100 text-sm leading-none cursor-pointer text-gray-600 rounded-t-lg pt-2 pb-2 mr-4 px-4 shadow-sm transition hover:bg-zumthor-300"
        style={{ minWidth: 48, margin: '1px 1px 0 0' }}
      >
        Nowa karta
      </p>
    </div>
  );
};

export default TabsDemo;