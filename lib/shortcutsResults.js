const ptzInput = document.getElementById("ptzValues");
const mouseInput = document.getElementById("mouseCoordinates");
const keynoteInput = document.getElementById("keynoteNotes");
const powerPointInput = document.getElementById("powerPointNotes");
ptzInput.addEventListener("click", ptzSend);
mouseInput.addEventListener("click", mouseSend);
keynoteInput.addEventListener("click", keynoteSend);
powerPointInput.addEventListener("click", powerPointSend);

function ptzSend() {
  console.log("ptz input clicked");
  console.log(ptzInput.value);
  let shortcutsResult = ptzInput.value;
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "ptz-message",
      event_data: { shortcutsResult },
    },
  });
}
function mouseSend() {
  console.log("mouse input clicked");
  console.log(mouseInput.value);
  let shortcutsResult = mouseInput.value;
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "mouse-message",
      event_data: { shortcutsResult },
    },
  });
}
function keynoteSend() {
  console.log("keynoteNotes input clicked");
  console.log(keynoteInput.value);
  let shortcutsResult = keynoteInput.value;
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "keynote-message",
      event_data: { shortcutsResult },
    },
  });
}

//
//Process PowerPoint Slide
//
async function powerPointSend() {
  console.log("powerPointNotes input clicked");
  console.log(powerPointInput.value);
  let pptData = JSON.parse(powerPointInput.value);
  console.log(pptData);
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "powerpoint-message",
      event_data: { pptData },
    },
  });
 //if pptData has scene
 if (pptData.hasOwnProperty("scene")) {
  await obs.call("SetCurrentProgramScene", {
    sceneName: `scene|||${pptData.scene}`
  });
}

//if pptData has notes
if (pptData.hasOwnProperty("notes")) {
  await obs.call("SetInputSettings", {
    inputName: "Slide Notes Text",
    inputSettings: {
      text: JSON.parse(pptData.notes).replaceAll("\r", "\n")
    }
  });

  //Reset the teleprompter
  await obs
    .call("SetSourceFilterSettings", {
      sourceName: "Slide Notes Text",
      filterName: "Scroll",
      filterSettings: {
        speed_y: 0
      }
    })
    .then(
      setTimeout(async () => {
        await obs.call("SetSourceFilterSettings", {
          sourceName: "Slide Notes Text",
          filterName: "Scroll",
          filterSettings: {
            speed_y: teleprompterSpeed
          }
        });
      }, 1000)
    );
}

//if pptData has camera
if (pptData.hasOwnProperty("camera")) {
  let cameraSources = await obs.call("GetSceneItemList", { sceneName: "Camera" });
  cameraSources.sceneItems.forEach(async (source) => {
    if (source.sourceName === pptData.camera) {
      await obs.call("SetSceneItemEnabled", {
        sceneName: "Camera",
        sceneItemId: source.sceneItemId,
        sceneItemEnabled: true
      });
    } else {
      await obs.call("SetSceneItemEnabled", {
        sceneName: "Camera",
        sceneItemId: source.sceneItemId,
        sceneItemEnabled: false
      });
    }
  });
}

}