import React, { useState, useEffect } from 'react';

const Tabs = ({socket, getActiveTab}) => {
  const [numberOfTabs, setNumberOfTabs] = useState(); 
  const [activeTab, setActiveTab] = useState();
  const [tabChanged, setTabChanged] = useState(false)

  useEffect(() => { 
     socket.on('numberOfTabsAndActive', (data) => {
      console.log("numberOfTabsAndActive received, number of tabs: " + data.numberOfTabs)
         setNumberOfTabs(data.numberOfTabs)
         setActiveTab(data.activeTab)
     })	
     
     socket.on('tabChanged', (data) => {
         setActiveTab(data.activeTab);
     })

 }, [socket])

  const addTab = () => {
    setNumberOfTabs((prevNumberOfTabs) => prevNumberOfTabs + 1)
  }

  const selectTab = (e) => {
    var id = e.target.id
    setActiveTab(Number(id))
    setTabChanged(true)
  }

  useEffect(() => {
      if (numberOfTabs) {
        socket.emit('newtab', { numberOfTabs })
      }
  }, [numberOfTabs])

  useEffect(() => {
    if(tabChanged) {
        socket.emit('tabChanged', {activeTab})
        setTabChanged(false)
    }
}, [tabChanged])

  useEffect(() => {
    if (activeTab) {
      // set active class to the clicked tab
      var tabs = document.getElementsByClassName("tab")
      Array.from(tabs).forEach((element) => {
        element.classList.remove("text-gray-600", "hover:text-indigo-700", "border-t", "border-transparent", "hover:border-indigo-400");
      });
      document.getElementById(activeTab).classList.add("text-indigo-700", "border-t", "border-indigo-400", "pt-3");

      getActiveTab(activeTab)
    }
  }, [activeTab])

  return (
    <div className="sm:flex hidden">
      {[...Array(numberOfTabs)].map((e, i) => <p key={i + 1} className="tab text-sm font-medium leading-none cursor-pointer text-gray-600 hover:text-indigo-700 border-t border-transparent hover:border-indigo-400 pt-3 mr-4 px-2" id={i + 1} onClick={selectTab}>{i + 1}</p>)}
      <p className="text-sm font-medium leading-none cursor-pointer text-gray-600 hover:text-indigo-700 border-t border-transparent hover:border-indigo-400 pt-3 mr-4 px-2" onClick={addTab}>Nowa karta</p>
    </div>
  );
}

export default Tabs;