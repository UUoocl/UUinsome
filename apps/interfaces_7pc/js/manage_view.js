  
    //load p5 after connecting to OBS
    obsWss.on("Identified", async (data) => {
      //on obs connection get query paramater
      const params = new URLSearchParams(window.location.search)
      if(params.has("preset")){
        hideCanvasUI = true;
        document.getElementById("loadSelect").value = `${params.get("preset")}.json`
        loadSettings()  
        hideui()
      }else{
        console.log("add a preset parameter")
      }
      //stop if not preset found
    })
    
    function hideui(){
      try{
        //control the p5 draw loop

        //hide all body elements except main and script elements
        const bodyElements = document.querySelectorAll('body > *:not(main):not(script):not(canvas)');
        bodyElements.forEach(element => {
          element.style.display = "none";;
        });
        
        const mainElements = document.querySelectorAll('body > main > *:not(canvas)');
        mainElements.forEach(element => {
          element.style.display = "none";;
        });

      }catch(err){
        console.log("error hiding ui", err)
      }
    }