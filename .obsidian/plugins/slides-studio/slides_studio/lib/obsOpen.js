let configMap = new Map();


//check local storage for OBS Web Socket Details
//on load, if storage item exists
window.addEventListener('load', async function() {
  if(localStorage.getItem('wssDetails') !== null){
    //try to connect
    // console.debug("try saved websocket details")
    const wssDetails = JSON.parse(window.localStorage.getItem('wssDetails'));
  }

  if (localStorage.getItem("configName")) {
      getLocalStorageConfigOptions();
  }

  obsLaunchCommand();

})

async function wsConnect() {
  const wssDetails = {
    IP: document.getElementById("IP").value,
    PORT: document.getElementById("Port").value,
    PW: document.getElementById("PW").value,
  };

  localStorage.setItem("wssDetails", JSON.stringify(wssDetails))

// Saves config data to retrieve later
configMap.set(`${document.getElementById("configName").value}`,
    {
        obsName: document.getElementById("obsName").value,
        profileName: document.getElementById("profileName").value,
        collectionName: document.getElementById("collectionName").value,
        IP: wssDetails.IP,
        Port: wssDetails.PORT,
        obsPW: wssDetails.PW,
        debugMode: document.getElementById("Debug").checked,
    })

localStorage.setItem("configName", document.getElementById("configName").value);
const str = JSON.stringify(configMap, replacer)
localStorage.setItem("configName", str);
  
  await connectOBS(wssDetails)
    .then(async (result) => {
      if (result === "failed") {
        document.getElementById("WSconnectButton").style.background = "#ff0000";
      }
      if (result === "connected") {
        document.getElementById("WSconnectButton").style.background = "#00ff00";
      }
  });
}

async function sendWSSdetails() {
  const event_name = `ws-details-for-client-${rtcID}`;
  // console.debug("event_name",event_name, wssDetails);
  await obsWss.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: event_name,
      event_data: { wssDetails },
    },
  })
}

function replacer(key, value) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

function reviver(key, value) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}

function getLocalStorageConfigOptions() {
    //get configurations in local storage
    configMap = JSON.parse(localStorage.getItem("configName"), reviver)

    for (const key of configMap.keys()) {
        const parentElement = document.getElementById("configNameValues");
        const newElement = document.createElement("option");
        newElement.textContent = key;
        parentElement.appendChild(newElement);
    }
}

function getLocalStorageConfigValue(selectedConfig) {
    const config = localStorage.getItem("configName")
    //get configurations in local storage
    configItem = configMap.get(selectedConfig);

    document.getElementById("configName").value = selectedConfig;
    document.getElementById("obsName").value = configItem?.obsName;
    document.getElementById("IP").value = configItem?.IP;
    document.getElementById("Port").value = configItem?.Port;
    document.getElementById("PW").value = configItem?.obsPW;
    document.getElementById("profileName").value = configItem?.profileName;
    document.getElementById("collectionName").value = configItem?.collectionName;
    document.getElementById("Debug").value = configItem?.debugMode;
}

function configSelected() {
    const selectedValue = this.value;
    // Perform actions based on the selected value

    // Check if the selected value exists in the datalist options
    const datalist = document.getElementById(this.getAttribute('list'));
    let optionFound = false;
    for (let i = 0; i < datalist.options.length; i++) {
        if (selectedValue === datalist.options[i].value) {
            optionFound = true;
            break;
        }
    }

    if (optionFound) {
        getLocalStorageConfigValue(selectedValue)
    } else {
        console.error("Not a valid selection from datalist");
        //Actions when the input doesn't match any datalist option
    }

    //updateCollectionControlLinks();
}

function obsLaunchCommand(event){
    const obsParameters = document.getElementById("obsData")
    let commandString = '';
    if(window.navigator.platform.startsWith("Mac")){
        commandString = 'open -n -a "';
    }else{
        document.getElementById("openOBSbutton").hidden = true;
        document.getElementById("obsNameLabel").innerText = "Enter OBS app name including path:"
        commandString = '"';
    }
    commandString += obsParameters.obsName.value;
    commandString += '" --args --profile "';
    commandString += obsParameters.profileName.value ;
    commandString += '" --collection "';
    commandString += obsParameters.collectionName.value ;
    commandString += '" --websocket_port "';
    commandString += obsParameters.Port.value ;
    commandString += '" --websocket_password "';
    commandString += obsParameters.PW.value ;
    commandString += '" --multi';
    if(obsParameters.Debug.checked){
        commandString += ' --remote-debugging-port=9222 --remote-allow-origins=http://localhost:9222';
    }
    
//   --websocket_password "Dictionary (password)"
    // const changedElement = event.target;
    // const elementName = changedElement.name;
    // const newValue = changedElement.value;

    // console.debug(`Element ${elementName} changed to: ${newValue}`);
    document.getElementById('obsOpenCommand').value = commandString
}

async function copyCode(triggerButton, elementToCopy, buttonText) {
    event.preventDefault()
  
    const button = document.getElementById(triggerButton)
    if(button.innerText.endsWith("Copied")){
        return //copied
    }else{
        let copyText = document.getElementById(elementToCopy).value//"obsOpenCommand");
        await navigator.clipboard.writeText(copyText);
    }

    // visual feedback that task is completed
    button.innerText = `${buttonText} Copied`;

    setTimeout(() => {
        button.innerText = buttonText;
    }, 7000);
}

function openOBS() {
    let slideHREF = window.location.href;
    // "path":"${slideHREF}",
    let inputArray = JSON.stringify(`{"obsName":"${document.getElementById("obsName").value}","profileName":"${document.getElementById("profileName").value}","collectionName":"${document.getElementById("collectionName").value}","ip":"${document.getElementById("IP").value}","port":"${document.getElementById("Port").value}","password":"${document.getElementById("PW").value}"}`)
    if (document.getElementById("Debug").checked) {
        window.open(`shortcuts://run-shortcut?name=INPUT-Open_OBS_Profile-Collection-WebSocket-DEBUG&input=text&text=${inputArray}`, "_self");
    } else {
        window.open(`shortcuts://run-shortcut?name=INPUT-Open_OBS_Profile-Collection-WebSocket&input=text&text=${inputArray}`, "_self");
    }
}

obsWss.on("Identified", async (data) => {
    // console.debug("OBS WebSocket successfully identified", data);

    document.getElementById("WSconnectButton").style.background = "#00ff00";

    //send websocket server connection details to OBS browser sources
    const wssDetails = JSON.parse(window.localStorage.getItem('wssDetails'))
 
    await obsWss.call("CallVendorRequest", {
        vendorName: "obs-browser",
        requestType: "emit_event",
        requestData: {
            event_name: "ws-details",
            event_data: { wssDetails },
        },
    });
    
    // sendToOBS(wssDetails, "ws-details");
    sendToOBS({ url: `${document.getElementById("location").value}/fullscreen?postMessageEvents=true` }, "setSource");

    //show speaker view
    if(document.getElementById("location").value.length > 0){
      loadSpeakerView();
    }
    
});

function sendToOBS(msgParam, eventName, eventDetailName) {
    //console.debug("sending message:", JSON.stringify(msgParam));
    const webSocketMessage = JSON.stringify(msgParam);
    //send results to OBS Browser Source
    obsWss.call("CallVendorRequest", {
        vendorName: "obs-browser",
        requestType: "emit_event",
        requestData: {
            event_name: eventName,
            event_data: { 
                webSocketMessage 
            },
        },
    });
}