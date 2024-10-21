document.getElementById("nextSlideButton").addEventListener('click', () =>{
    window.open("shortcuts://run-shortcut?name=UUinsome PowerPoint Next Chrome","_self");
})

document.getElementById("previousSlideButton").addEventListener('click', () =>{
    window.open("shortcuts://run-shortcut?name=UUinsome PowerPoint Previous Chrome","_self");
})

function addTagToSlide(param){
    console.log(param.dataset)
    window.open(`shortcuts://run-shortcut?name=UUinsome PowerPoint Add Tag&input=text&text=${JSON.stringify(param.dataset)}`,"_self");
}


document.getElementById("IncreaseSizeButton").addEventListener("click", () => {changeTeleprompterSize(1)})
document.getElementById("DecreaseSizeButton").addEventListener('click', () => {changeTeleprompterSize(-1)})
document.getElementById("IncreaseSpeedButton").addEventListener('click', () => {changeTeleprompterSpeed(1)})
document.getElementById("DecreaseSpeedButton").addEventListener('click', () => {changeTeleprompterSpeed(-1)})


async function changeTeleprompterSize(event) {
    console.log(event)
    teleprompterSize = Number(document.getElementById("sizeValue").value);
    teleprompterSize += event;
    await obs.call("SetInputSettings", {
      inputName: "Slide Notes Text",
      inputSettings: {
        font: {
          size: teleprompterSize
        }
      }
    });
    document.getElementById("sizeValue").value = teleprompterSize;
  }

  async function changeTeleprompterSpeed(event) {
    teleprompterSpeed = Number(document.getElementById("speedValue").value);
    teleprompterSpeed += event.data.change;
    document.getElementById("speedValue").value = teleprompterSpeed;
    await obs.call("SetSourceFilterSettings", {
      sourceName: "Slide Notes Text",
      filterName: "Scroll",
      filterSettings: {
        speed_y: teleprompterSpeed
      }
    });
  }