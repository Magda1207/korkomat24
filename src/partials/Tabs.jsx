import { useState, useEffect } from 'react';
import { useFetch } from '../server/common/apiCalls'
import axios from 'axios';

const Tabs = ({ socket, getActiveTab, canvasWidth }) => {
  const [tabs, setTabs] = useState();
  const [numberOfTabsApi] = useFetch('/api/numberOfTabs', null, []);
  const [activeTab, setActiveTab] = useState();

  // Inicjalizacja tabs z API
  useEffect(() => {
    if (numberOfTabsApi.numberOfTabs >= 0) {
      const realFiles = numberOfTabsApi.tabFiles
        ? numberOfTabsApi.tabFiles.map(String).sort((a, b) => Number(a) - Number(b))
        : ["1"];
      setTabs(realFiles);
      setActiveTab(realFiles[0]);
      getActiveTab(realFiles[0], false, false);
    }
  }, [numberOfTabsApi]);

  // Obsługa socketów (real IDs)
  useEffect(() => {
    const onTabChanged = ({ activeTabRemote }) => {
      if (!activeTabRemote) return;
      const realId = String(activeTabRemote);
      if (!tabs.includes(realId)) {
        setTabs(prev => [...prev, realId].sort((a, b) => Number(a) - Number(b)));
      }
      setActiveTab(realId);
      getActiveTab(realId, false, true);
    };

    const onTabClosed = ({ tabs: newTabs, activeTab: newActive, skipSave }) => {
      // newTabs zawiera real IDs z backendu
      const sorted = newTabs.map(String).sort((a, b) => Number(a) - Number(b));
      setTabs(sorted);
      setActiveTab(String(newActive));
      getActiveTab(String(newActive), skipSave || false, true);
    };

    socket.on('tabChanged', onTabChanged);
    socket.on('tabClosed', onTabClosed);
    return () => {
      socket.off('tabChanged', onTabChanged);
      socket.off('tabClosed', onTabClosed);
    };
  }, [socket, tabs]);

  // Dodawanie nowej karty (real ID = max + 1)
  const addTab = () => {
    const newRealId = tabs.length
      ? String(Math.max(...tabs.map(Number)) + 1)
      : "1";
    const newTabs = [...tabs, newRealId].sort((a, b) => Number(a) - Number(b));
    setTabs(newTabs);
    setActiveTab(newRealId);
    getActiveTab(newRealId);
    socket.emit('tabChanged', { activeTabRemote: newRealId });
  };

  // Zmiana aktywnej karty (po display index)
  const selectTab = (e, idx) => {
    const realId = tabs[idx];
    setActiveTab(realId);
    socket.emit('tabChanged', { activeTabRemote: realId });
    getActiveTab(realId, false);
  };

  // Zamknięcie karty (używamy real ID, wyświetlamy sekwencję)
  const closeTab = async (e, idx) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const closingRealId = tabs[idx];
    const remaining = tabs.filter(t => t !== closingRealId);
    let newActiveReal = activeTab;
    let skipSave = false;
    if (activeTab === closingRealId) {
      newActiveReal = remaining[Math.max(0, idx - 1)] ?? remaining[0];
      skipSave = true;
      setActiveTab(newActiveReal);
    }
    setTabs(remaining);

    try {
      await axios.delete(`/api/tab/${closingRealId}`);
    } catch (err) {
      console.error('Błąd podczas usuwania pliku karty:', err);
    }

    socket.emit('tabClosed', { tabs: remaining, activeTab: newActiveReal, skipSave });
    getActiveTab(newActiveReal, skipSave);
  };

  return (
    <div className="flex flex-wrap bg-light-blue" style={{ width: canvasWidth }}>
      {tabs?.map((realId, i) => {
        const disp = String(i + 1); // numer ciągły
        return (
          <div
            key={realId}
            className={`relative flex items-center tab rounded-t-lg text-sm font-medium leading-none cursor-pointer text-gray-600 border-t pt-3 px-4 ${activeTab === realId ? "bg-white" : "bg-zumthor-100"}`}
            onClick={e => selectTab(e, i)}
            style={{ minWidth: 24, maxWidth: 180, margin: '1px 1px 0 0' }}
          >
            <span className="truncate pr-2 pb-3">{disp}</span>
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
        );
      })}
      <p
        id="newTab"
        className="flex items-center justify-center bg-zumthor-100 text-sm leading-none cursor-pointer text-gray-600 rounded-t-lg pt-2 pb-2 mr-4 px-4 shadow-sm transition hover:bg-zumthor-300"
        style={{ minWidth: 48, margin: '1px 1px 0 0' }}
        onClick={addTab}
      >
        Nowa karta
      </p>
    </div>
  );
};

export default Tabs;