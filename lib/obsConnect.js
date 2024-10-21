document
  .getElementById("WSconnectButton")
  .addEventListener("click", connectOBS);

  document.addEventListener("DOMContentLoaded", (event) => {
    if(localStorage.getItem("IP")){
      document.getElementById("IP").value = localStorage.getItem("IP");
      document.getElementById("Port").value = localStorage.getItem("Port");
      document.getElementById("PW").value = localStorage.getItem("PW");  
    }    
  });

var wssDetails;
var obs = new OBSWebSocket();
async function connectOBS() {
  const websocketIP = document.getElementById("IP").value;
  const websocketPort = document.getElementById("Port").value;
  const websocketPassword = document.getElementById("PW").value;

  // Saves data to retrieve later
  localStorage.setItem("IP", websocketIP);
  localStorage.setItem("Port", websocketPort);
  localStorage.setItem("PW", websocketPassword);

  //connect to OBS web socket server
  try {
    const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
      `ws://${websocketIP}:${websocketPort}`,
      websocketPassword,
      {
        rpcVersion: 1,
      }
    );
    console.log(
      `Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
    );

    document.getElementById("WSconnectButton").style.background = "#00ff00";
    wssDetails = {
      IP: websocketIP,
      PORT: websocketPort,
      PW: websocketPassword,
    };
    //send websocket server connection details to OBS browser source
    await obs.call("CallVendorRequest", {
      vendorName: "obs-browser",
      requestType: "emit_event",
      requestData: {
        event_name: "ws-details",
        event_data: { wssDetails },
      },
    });
  } catch (error) {
    console.error("Failed to connect", error.code, error.message);
    document.getElementById("WSconnectButton").style.background = "#ff0000";
  }
  obs.on("error", (err) => {
    console.error("Socket error:", err);
  });
  console.log(`ws://${websocketIP}:${websocketPort}`);
  getScenes();
  getSceneList();
  getTeleprompterSize();
  getTeleprompterSpeed();
  getSlideControlSceneItems();
  return obs;
}

async function refreshOBSbrowsers(){
      
  let SceneItems = await obs.call("GetSceneItemList", {
    sceneName: "rtc_target",
  });
  
  SceneItems = SceneItems.sceneItems;
  console.log(SceneItems)
  const browsers = await SceneItems.filter(async (item) => {
    console.log("item",item)
    if (item.inputKind == "browser_source") {
      await obs.call("PressInputPropertiesButton", {
        inputUuid: item.sourceUuid,
        propertyName: "refreshnocache",
      });
    }
  });
  setTimeout(connectOBS,1000)
  console.log('browser refresh complete')
}

async function sendWSSdetails() {
  const event_name = `ws-details-for-client-${rtcID}`;
  console.log("event_name",event_name, wssDetails);
  await obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: event_name,
      event_data: { wssDetails },
    },
  })
    }


    async function getSceneList() {
      let sceneTable = "";
      sceneTable +=
        "<table border=1 cellpadding=3 cellspacing=0><tr><td bgcolor=#3333EE><font color=white>Enter</font></td><td bgcolor=#3333EE><font color=white>Exit</font></td></tr>";
      const sceneList = await obs.call("GetSceneList");
      sceneList.scenes.forEach((scene, index) => {
        // find scenes starting with "Scene"
        if (scene.sceneName.startsWith("scene|||")) {
          //document.getElementById("sceneList").innerHTML =
          //document.getElementById("sceneList").innerHTML + `<li class="ms-Button">${scene.sceneName}</li>`;
          const sceneName = scene.sceneName.split("|||");
          sceneTable +=
            "<tr><td>" +
            `<li class="ms-Button" data-left = -355 data-top = 35 data-type= "scene" data-event = "\\\\\\" data-height = 25 data-width = 340 data-color = "9CD3D9" data-transparency = 0 id="scene\\\\\\ ${sceneName[1]}" onclick=addTagToSlide(this)>${sceneName[1]}</li>` +
            "</td><td>" +
            `<li class="ms-Button" data-left = -355 data-top = 305 data-type= "scene" data-event = "///" data-height = 25 data-width = 340 data-color = "FFA99B" data-transparency = 0.01 id="scene/// ${sceneName[1]}" onclick=addTagToSlide(this)>${sceneName[1]}</li>` +
            "</td></tr>";
        }
        if (scene.sceneName === "Camera") {
          getCameraList();
        }
      });
      //addListItemClickListener();
      sceneTable += "</table>";
      document.getElementById("sceneList").innerHTML = sceneTable;
    }
    
    async function getCameraList() {
      let cameraTable = "";
      cameraTable +=
        "<table border=1 cellpadding=3 cellspacing=0><tr><td bgcolor=#3333EE><font color=white>Enter</font></td><td bgcolor=#3333EE><font color=white>Exit</font></td></tr>";
      let cameraSources = await obs.call("GetSceneItemList", { sceneName: "Camera" });
      cameraSources.sceneItems.forEach((source, index) => {
        document.getElementById("cameraList").innerHTML =
          document.getElementById("cameraList").innerHTML +
          `<li class="ms-Button" data-left = -355 data-top = 35 data-type= "camera" data-event = "\\\\\\" data-height = 25 data-width = 340 data-color = "9CD3D9" data-transparency = 0 id="camera\\\\\\ ${source.sourceName}" onclick=addTagToSlide(this)>${source.sourceName}</li>`;
        cameraTable +=
          "<tr><td>" +
          `<li class="ms-Button" data-left = -355 data-top = 65 data-type= "camera" data-event = "\\\\\\" data-height = 25 data-width = 340 data-color = "9CD3D9" data-transparency = 0 id="camera\\\\\\ ${source.sourceName}" onclick=addTagToSlide(this)>${source.sourceName}</li>` +
          "</td><td>" +
          `<li class="ms-Button" data-left = -355 data-top = 335 data-type= "camera" data-event = "///" data-height = 25 data-width = 340 data-color = "FFA99B" data-transparency = 0.01 id="camera/// ${source.sourceName}" onclick=addTagToSlide(this)>${source.sourceName}</li>` +
          "</td></tr>";
      });
      cameraTable += "</table>";
      document.getElementById("cameraList").innerHTML = cameraTable;
    }

    async function getTeleprompterSize() {
      teleprompterSize = await obs.call("GetInputSettings", {
        inputName: "Slide Notes Text"
      });
      teleprompterSize = teleprompterSize.inputSettings.font.size;
      document.getElementById("sizeValue").value = teleprompterSize;
    }
    
    async function getTeleprompterSpeed() {
      teleprompterSpeed = await obs.call("GetSourceFilter", {
        sourceName: "Slide Notes Text",
        filterName: "Scroll"
      });
      teleprompterSpeed = teleprompterSpeed.filterSettings.speed_y;
      document.getElementById("speedValue").value = teleprompterSpeed;
    }

    async function getSlideControlSceneItems() {
      controlSources = await obs.call("GetSceneItemList", { sceneName: "Slide Controls" });
    }
