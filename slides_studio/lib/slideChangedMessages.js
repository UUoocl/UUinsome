let slideState = '';
const iframe = document.getElementById("slidesDeck");

//Message from Reveal Slides iFrame API
window.addEventListener('message', async (event) => {
    if(event.origin === slideDeckURL.origin){  
    //console.log(event)
    let data = JSON.parse(event.data);

    //remove speakerview hotkey
    if (data.namespace === 'reveal' && 
    ['ready'].includes(data.eventName)) {
        iframe.contentWindow.postMessage(JSON.stringify({ method: 'removeKeyBinding', args: [83] }), '*');
    }
    
    //on reveal slide change or pause
    if (data.namespace === 'reveal' && 
    ['paused','resumed','fragmentshown','fragmenthidden','slidechanged'].includes(data.eventName)) {
        console.log("Slide Changed", event)
        
        //if event 'state' doesn't equal settings 'state'
        if(JSON.stringify(data.state) != slideState){
            slideState = JSON.stringify(data.state);
            //send slide change to OBS
            sendToOBS(data.state, "slide-changed");	
        }
    }
    
    //on overview mode
    if (data.namespace === 'reveal' && 
    ['overviewhidden','overviewshown'].includes(data.eventName)) {
        console.log("overview Changed", event)
        
        //Send CustomEvent to OBS webSocket clients
        slideState = data.state;
        console.log("sending custom message", slideState)
        obsWss.call("BroadcastCustomEvent", {
            eventData:{
                eventName:"overview-toggled",
                eventData: slideState,
            }    
        });
    }  
}          
});

//Custom Event message from OBS
obsWss.on("CustomEvent", async function (event) {
    console.log("CUSTOMEVENT ",event.eventData, "var",slideState);
    console.log("CUSTOMEVENT =?", event.eventData === slideState);
    if(['overview-toggled','slide-changed'].includes(event.eventName)){
        if(event.eventData != slideState){
            console.log("update slide state");
            const data =JSON.parse(event.eventData)
            data.indexf = data.indexf ? data.indexf : 0;
            if(event.eventName === 'overview-toggled'){
                iframe.contentWindow.postMessage( JSON.stringify({ method: 'toggleOverview', args: [ data.overview ] }), '*' );
            }else{
                iframe.contentWindow.postMessage(JSON.stringify({ method: 'slide', args: [data.indexh, data.indexv, data.indexf] }), '*');
                iframe.contentWindow.postMessage( JSON.stringify({ method: 'togglePause', args: [ data.paused ] }), '*' );
            }
        }
    } 
});
