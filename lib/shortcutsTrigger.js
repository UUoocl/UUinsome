//Slide Controls

document.getElementById("nextSlideButton").addEventListener('click', () =>{
  let uuinsomeHREF = window.location.href;
  let inputArray = JSON.stringify([uuinsomeHREF,"Next"])
  let selectedApp = document.querySelector('input[name="appRadio"]:checked').value 
    window.open(`shortcuts://run-shortcut?name=UUinsome ${selectedApp} Slide Navigation Chrome&input=text&text=${inputArray}`,"_self");
})

document.getElementById("previousSlideButton").addEventListener('click', () =>{
  let uuinsomeHREF = window.location.href
  let inputArray = JSON.stringify([uuinsomeHREF,"Previous"])
  let selectedApp = document.querySelector('input[name="appRadio"]:checked').value 
    window.open(`shortcuts://run-shortcut?name=UUinsome ${selectedApp} Slide Navigation Chrome&input=text&text=${inputArray}`,"_self");
})

function addTagToSlide(param){
  let inputObject = param.dataset
  inputObject.tagLocationHref = window.location.href
  if(document.querySelector('input[name="appRadio"]:checked').value === "Keynote"){
    inputObject.tagHeight = 100;
    inputObject.tagWidth = 600;
    inputObject.tagLeft = inputObject.tagEvent === "///" ? 800:0;
    inputObject.tagTop = inputObject.tagType === "scene" ? -100:-200;
  }
  let selectedApp = document.querySelector('input[name="appRadio"]:checked').value
    window.open(`shortcuts://run-shortcut?name=UUinsome ${selectedApp} Add Tag&input=text&text=${JSON.stringify(param.dataset)}`,"_self");
}


//Teleprompter Controls
document.getElementById("IncreaseSizeButton").addEventListener("click", () => {changeTeleprompterSize(1)})
document.getElementById("DecreaseSizeButton").addEventListener('click', () => {changeTeleprompterSize(-1)})
document.getElementById("IncreaseSpeedButton").addEventListener('click', () => {changeTeleprompterSpeed(1)})
document.getElementById("DecreaseSpeedButton").addEventListener('click', () => {changeTeleprompterSpeed(-1)})
document.getElementById("playPauseButton").addEventListener('click', togglePlayPause)


async function changeTeleprompterSize(event) {
  teleprompterSize = Number(document.getElementById("sizeValue").value);
  teleprompterSize += event;
  await obs.call("SetInputSettings", {
    "inputName": "Slide Notes Text",
    "inputSettings": {
      "font": {
        "face": "Arial",
        "size": teleprompterSize
      }
    }
  });
  document.getElementById("sizeValue").value = teleprompterSize;
}

async function changeTeleprompterSpeed(event) {
    console.log(event)
    teleprompterSpeed = Number(document.getElementById("speedValue").value);
    teleprompterSpeed += event;
    document.getElementById("speedValue").value = teleprompterSpeed;
    await obs.call("SetSourceFilterSettings", {
      sourceName: "Slide Notes Text",
      filterName: "Scroll",
      filterSettings: {
        speed_y: teleprompterSpeed
      }
    });
  }

async function togglePlayPause() {
  teleprompterIsPlaying = !teleprompterIsPlaying;
  const speed = teleprompterIsPlaying === true ? teleprompterSpeed : 1;

  await obs.call("SetSourceFilterSettings", {
    sourceName: "Slide Notes Text",
    filterName: "Scroll",
    filterSettings: {
      speed_y: speed
    }
  });
  if (teleprompterIsPlaying) {
    document.getElementById("playPauseButton").value = "Pause";
  } else {
    document.getElementById("playPauseButton").value = "Play";
  }
}

//OBS HotKey Controls

obs.on("SceneItemEnableStateChanged", async function(event) {
  //if ppt scriptlab text source
  if (event.sceneItemEnabled === true && event.sceneName === "Slide Controls") {
    //get source name
    let sceneItem = getSceneItemName(event.sceneItemId);

    const control = sceneItem.sourceName;
    //if next
    switch (control) {
      case "NextSlide":
        document.getElementById("nextSlideButton").click();
        break;
      case "PreviousSlide":
        document.getElementById("previousSlideButton").click();
        break;
      case "Play-Pause":
        document.getElementById("playPauseButton").click();
        break;
      case "Text Smaller":
        document.getElementById("DecreaseSizeButton").click();
        break;
      case "Text Bigger":
        document.getElementById("IncreaseSizeButton").click();
        break;
      case "Scroll Slower":
        document.getElementById("DecreaseSpeedButton").click();
        break;
      case "Scroll Faster":
        document.getElementById("IncreaseSpeedButton").click();
        break;
    }
    
    //turn off source
     await obs.call("SetSceneItemEnabled", {
      sceneName: "Slide Controls",
      sceneItemId: event.sceneItemId,
      sceneItemEnabled: false
    });
  }
});

function getSceneItemName(itemID) {
  for (let i = 0; i < controlSources.sceneItems.length; i++) {
    if (controlSources.sceneItems[i].sceneItemId == itemID) {
      return controlSources.sceneItems[i];
    }
  }
}
