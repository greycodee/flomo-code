chrome.storage.onChanged.addListener((changes,areaName) => {
        console.log("storage change",changes,areaName);
    }
  )

  chrome.tabs.onCreated.addListener(
    (tab)=>{
        console.log("tab created",tab);
          
    }
  )