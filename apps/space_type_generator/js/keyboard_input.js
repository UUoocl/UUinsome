    let hotKeyTimer;    
    let PRESET_SETTINGS
    
    function setHotkeyText(newText){
      PRESET_SETTINGS.text = newText;
      try{inp.value(newText);
      }
      catch{}
      setSketchSettings(PRESET_SETTINGS)
    }

    obsWss.on("InputSettingsChanged", async function (event) {
      switch (event.inputName) {
        case 'keyHotkey':
          if (event.inputSettings.text.includes('+')) {
            console.log(event.inputSettings.text)
            setHotkeyText(event.inputSettings.text);
            hotKeyTimer = 3;
          }
          break;
        default:
          break;
        }
    })