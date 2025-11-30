const dropDownOptions = {
    scene:[],
    cameraPosition:[],
    cameraShape:[],
    slidePosition:[]
}


obsWss.on("Identified", async (data) => {
        //get Scene options
    if(document.getElementById("location").value.length > 0){       
        let sceneList = [];
        sceneList = await obsWss.call("GetSceneList");
        sceneList.scenes.forEach(async (scene, index) => {
            if(scene.sceneName.startsWith("Scene")){
                const sceneName = scene.sceneName;
                //  console.log(sceneName)
                dropDownOptions.scene.push(sceneName);
            }
        });
        
        //get Camera Position tag options
        let cameraSources = [];
        cameraSources = await obsWss.call("GetSceneItemList", { sceneName: "Camera Position" });
        //console.log(cameraSources)
        cameraSources.sceneItems.forEach(async(source, index) => {
            dropDownOptions.cameraPosition.push(source.sourceName)
        });
                
        //get Slide Position tag options
        let slideSources = [];
        slideSources = await obsWss.call("GetSceneItemList", { sceneName: "Slide Position" });
        //console.log(cameraSources)
        slideSources.sceneItems.forEach(async(source, index) => {
            dropDownOptions.slidePosition.push(source.sourceName)
        });
        
        //get Camera Shape tag options
        let shapeSources = [];
        shapeSources = await obsWss.call("GetSceneItemList", { sceneName: "Camera Shape" });
        console.log("shapreSources", shapeSources)
        shapeSources.sceneItems.forEach(async(source, index) => {
            dropDownOptions.cameraShape.push(source.sourceName)
        });
        
        console.log("dropDownOptions", dropDownOptions)
        if(slidesArray.length > 0){
            // document.getElementById("slidesTable").hidden = false;
        }

        //send OBS data to tabulator iFrame.
        studioIframe.contentWindow.postMessage(JSON.stringify({ obsData: dropDownOptions, namespace: 'speakerview'}), window.location.origin);
        
        //listen for tabulator requests for OBS Data
        window.addEventListener('message', async (event) => {
            //console.log(event)
            //console.log(event.origin, window.location.origin)

            if(event.origin !== window.location.origin){  
                return
            }  

            let data = JSON.parse(event.data);
            //console.log(data)
            
            //request from tabulator iframe for slide data
            if(data.namespace === "tabulator" && data.message === "obs-data"){
                console.log("got the obs data request")
                    studioIframe.contentWindow.postMessage(JSON.stringify({ message:'obs-data-response', obsData: dropDownOptions, namespace: 'speakerview'}), window.location.origin);
            }  
        });
    }
})

function sendToOBS(msgParam, eventName) {
    //console.log("sending message:", JSON.stringify(msgParam));
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