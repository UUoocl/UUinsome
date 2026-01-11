//Establish Connection for OBS browser sources to the OBS Web Socket Server(WSS).
//ways to get the OBS websocket credentials
//1. Check if the URL query parameters includes WSS details
//2. Check if the browser local storage includes WSS details
//3. listen for a WSS details event message
//4. listen for a button press to start
//5. Check if a websocket details js variable has been defined
//6. Check if css variables are defined
//7. fetch from an api endpoint

let obsWss = new OBSWebSocket();

window.addEventListener('DOMContentLoaded', async function() {
  //obs css added after page load
  setTimeout(async () => {
    
    obsWss.connected = false;
    // console.debug("obsWssConnectionManager.js loaded");
    //get URL parameters
    const params = new URLSearchParams(window.location.search);
    //get local storage
    const localStorageWssDetails = localStorage.getItem('wssDetails');
    let cssVarWSSdetails = getComputedStyle(document.body).getPropertyValue('--websocket-details');  
    // const varWebsocketDetails = typeof websocketDetails;
    
    // fetch from local host
    let apiWSSdetails;
    try {
      const res = await fetch('/api/obswss');
      const creds = await res.json();
      if(!creds.IP || !creds.PORT) {
          apiWSSdetails = false;
      }

      apiWSSdetails = creds;
      console.debug(apiWSSdetails)
    } catch (e) {
      console.error(e);
      apiWSSdetails = false;
    }
  
  switch(true){
    //7. fetch the wss details from the local host api 
    case (apiWSSdetails.hasOwnProperty("IP")):
      const apiConnected = await connectOBS(apiWSSdetails);
      // console.debug("try api credentials", apiConnected)
      if(apiConnected === 'connected'){break;}
    //1. check if the URL has WSS details
    case params.has("wsspw"):
        wssDetails = {
          IP: params.get("wssip"),
          PORT: params.get("wssport"),
          PW: params.get("wsspw"),
        };
        const paramsConnected = await connectOBS(wssDetails);    
        if(paramsConnected === 'connected'){
          console.debug("parameter connection",paramsConnected)
          break;}
    //2. check local storage for OBS Web Socket Details
    case (localStorageWssDetails !== null):
      // console.debug("try saved websocket details")
      const localStorageConnected = await connectOBS(JSON.parse(window.localStorage.getItem('wssDetails')))    
      if(localStorageConnected === 'connected'){
        // console.debug("localStorage Connected",localStorageConnected)
        break;}
    //5. check if the variable named websocketDetails is defined
    case (typeof websocketDetails !== 'undefined' && websocketDetails !== undefined):
      const localVarConnected = await connectOBS(websocketDetails);
      console.debug("try websocketDetails variable",localVarConnected)
      if(localVarConnected === 'connected'){break;}
    //6. check if css variables are defined
    case (getComputedStyle(document.body).getPropertyValue('--websocket-details') != 'undefined'):
      console.debug("cssVarWSSdetails",getComputedStyle(document.body).getPropertyValue('--websocket-details'))
      const cssVarWSSdetails = JSON.parse(getComputedStyle(document.body).getPropertyValue('--websocket-details'));
      console.debug("cssVarWSSdetails",cssVarWSSdetails)
      const cssVarConnected = await connectOBS(cssVarWSSdetails);
      console.debug("try css websocketDetails",cssVarConnected)
      if(cssVarConnected === 'connected'){
        console.debug("cssVarConnected",cssVarConnected)
        break;}
  }
  }, 100);
})

//3. get web socket details from a message
window.addEventListener(`ws-details`, async function (event) {
  //event wss details
  // console.debug("message received: ", event)
  if(event.detail.hasOwnProperty('wssDetails')){
    await connectOBS(event.detail.wssDetails);
  }
})

//4. listen for a button press to start 
async function wsConnectButton() {
  //change to this.
  wssDetails = {
    IP: document.getElementById("IP").value,
    PORT: document.getElementById("Port").value,
    PW: document.getElementById("PW").value,
  };

  await connectOBS(wssDetails).then(async (result) => {
    if (result === "failed") {
      document.getElementById("WSconnectButton").style.background = "#ff0000";
    }
  });
}

//connect to OBS web socket server
async function connectOBS(wssDetails) {
  // console.debug("connectOBS", wssDetails);
  try {
    //avoid duplicate connections
    await disconnect();

    //connect to OBS Web Socket Server
    const { obsWebSocketVersion, negotiatedRpcVersion } = 
    await obsWss.connect(`ws://${wssDetails.IP}:${wssDetails.PORT}`,wssDetails.PW,{rpcVersion: 1,});
    // console.debug(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
    
    localStorage.setItem("wssDetails", JSON.stringify(wssDetails));  

    return "connected";
  } catch (error) {
    console.error("Failed to connect", error.code, error.message);
    //localStorage.setItem("wssDetails",null)
    return "failed";
  }
}

// window.addEventListener('storage', function(e) {
//   if (e.key === 'wssDetails') {
//     const newWssDetails = JSON.parse(e.newValue);
//     connectOBS(newWssDetails);
//   }})

async function disconnect () {
  try{
    await obsWss.disconnect()
    // console.debug("disconnected")
    obsWss.connected = false
  } catch(error){
    console.error("disconnect catch",error)
  }
}

obsWss.on('ConnectionOpened', () => {
  // console.debug('Connection to OBS WebSocket successfully opened');
  obsWss.status = "connected";
});

obsWss.on('ConnectionClosed', () => {
  // console.debug('Connection to OBS WebSocket closed');
  obsWss.status = "disconnected";
});

obsWss.on('ConnectionError', err => {
  console.error('Connection to OBS WebSocket failed', err);
});

obsWss.on("Identified", async (data) => {
  obsWss.connected = true;
  // console.debug("OBS WebSocket successfully identified", data);

});

obsWss.on("error", (err) => {
  console.error("Socket error:", err);
});

async function refreshOBSbrowsers(){
//refresh all browser sources
  let browserSources = await obsWss.call("GetInputList",{inputKind: "browser_source"})

  for(let i=0; i<browserSources.inputs.length; i++){
    await obsWss.call("PressInputPropertiesButton", {
        inputUuid: browserSources.inputs[i].inputUuid,
        propertyName: "refreshnocache",
      });
    }
}