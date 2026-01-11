    let hotKeyTimer;     
    let PRESET_SETTINGS

    function setHotkeyText(newText){
      try{
        PRESET_SETTINGS.text = newText;
      //   inp.value(newText);
      }
      catch{
        console.log("PRESET update")
        PRESET_SETTINGS.text = newText;
      }
      setSketchSettings(PRESET_SETTINGS)
    }

    const keyboardChannel = new BroadcastChannel('keyboard_event');

    keyboardChannel.onmessage = (event) => {
      const data = event.data;
      console.log(data)
      if (data && data.key && data.key.includes("+")) {
        console.log('Broadcast received:', data.key);
        setHotkeyText(data.key);
        hotKeyTimer = 3;
      }
    };