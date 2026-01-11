//let slideState = '';

//Message from Reveal Slides iFrame API
window.addEventListener('message', async (event) => {
    let data = JSON.parse(event.data);
    
    //on reveal slide change or pause
    if (data.namespace === 'reveal' && 
    ['paused','resumed','fragmentshown','fragmenthidden','slidechanged'].includes(data.eventName)) {
            //Send CustomEvent to OBS webSocket clients
        slideState = data.state;
        //console.debug("sending custom message", slideState)
        obsWss.call("BroadcastCustomEvent", {
            eventData:{
                eventName:"slide-changed",
                eventData: slideState,
            }    
        });
    }
    
    //on overview mode
    if (data.namespace === 'reveal' && 
    ['overviewhidden','overviewshown'].includes(data.eventName)) {
        // console.debug("overview Changed", event)
        
        //Send CustomEvent to OBS webSocket clients
        slideState = data.state;
        // console.debug("sending custom message", slideState)
        obsWss.call("BroadcastCustomEvent", {
            eventData:{
                eventName:"overview-toggled",
                eventData: slideState,
            }    
        });
    }            
});

//Message from OBS WebSocket Client
window.addEventListener('slide-changed', async (event) => {
    let data = JSON.parse(event.detail.webSocketMessage);
    // console.debug("received slide changed: ",data);
    const slidesState = data.slideState.split(",").map(value => Number(value))
    // console.debug("slide state: ",slidesState);
    const iframe = document.getElementById("revealIframe")
    iframe.contentWindow.postMessage( JSON.stringify({ method: 'slide', args: slidesState }), '*' );
    
    processTags(data)
})

//Message from OBS WebSocket Client
window.addEventListener('overview-changed', async (event) => {
    // console.debug("received overviews changed: ",JSON.parse(event.detail.webSocketMessage));
    const data = JSON.parse(event.detail.webSocketMessage);

    //if event 'state' doesn't equal settings 'state'
    if(JSON.stringify(data) != slideState){
    
        slideState = JSON.stringify(data);

        iframe.contentWindow.postMessage( JSON.stringify({ method: 'toggleOverview', args: [ data.overview ] }), '*' );

        //Send CustomEvent to OBS webSocket clients
        obsWss.call("BroadcastCustomEvent", {
            eventData:{
                eventName:"overview-toggled",
                eventData: slideState
            }    
        });
    }
})

//update slide deck URL
window.addEventListener('set-slides-studio-url', async (event) => {
    let data = JSON.parse(event.detail.webSocketMessage);
    document.getElementById("revealIframe").setAttribute("src", data.url);
})
