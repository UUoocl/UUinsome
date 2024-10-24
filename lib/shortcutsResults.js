const keynoteInput = document.getElementById("keynoteNotes");
const powerPointInput = document.getElementById("powerPointNotes");
keynoteInput.addEventListener("click", keynoteSend);
powerPointInput.addEventListener("click", powerPointSend);

async function keynoteSend() {
  //console.log("keynoteNotes input clicked");
  //console.log(keynoteInput.value);
  let shortcutsResult = JSON.parse(keynoteInput.value);
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "keynote-message",
      event_data: { shortcutsResult },
    },
  });
  //if pptData has scene
  //console.log(shortcutsResult.hasOwnProperty("scene"),shortcutsResult)
if (shortcutsResult.hasOwnProperty("scene")) {
  await obs.call("SetCurrentProgramScene", {
    sceneName: `scene|||${shortcutsResult.scene}`
  });
}

//if pptData has notes
if (shortcutsResult.hasOwnProperty("slideNotes")) {
  await obs.call("SetInputSettings", {
    inputName: "Slide Notes Text",
    inputSettings: {
      text: JSON.parse(shortcutsResult.slideNotes)
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

//if result has camera
if (shortcutsResult.hasOwnProperty("camera")) {
  let cameraSources = await obs.call("GetSceneItemList", { sceneName: "Camera" });
  cameraSources.sceneItems.forEach(async (source) => {
    if (source.sourceName === shortcutsResult.camera ) {
      await obs.call("SetSceneItemEnabled", {
        sceneName: "Camera",
        sceneItemId: source.sceneItemId,
        sceneItemEnabled: true
      });
    } 
    if (source.sourceName !== shortcutsResult.camera){
      await obs.call("SetSceneItemEnabled", {
        sceneName: "Camera",
        sceneItemId: source.sceneItemId,
        sceneItemEnabled: false
      });
    }
  });
}

}

//
//Process PowerPoint Slide
//
async function powerPointSend() {
  //console.log("powerPointNotes input clicked");
  //console.log(powerPointInput.value);
  let pptData = JSON.parse(powerPointInput.value);
  //console.log(pptData);
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
    if (source.sourceName === pptData.camera && source.sceneItemEnabled === false) {
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