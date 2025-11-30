let slideState = '';

//handle slide change message
//send slide change from slides iframe to table iframe
//send slide change from table iframe to slides iframe
//
//send changes to OBS browser source
//send table data to OBS browser source

//Message from page iFrames
window.addEventListener('message', async (event) => {

    let data;
    //Run these functions after the iframe in this page has loaded
    if(event.origin === window.location.origin && slidesLoaded == true){ 
        //read the message data
        data = JSON.parse(event.data);
        
        //#region messages from tabulator Iframe
        //when a row in the tabulator is selected, send the row data to the current slide iframe
        if (data.namespace === 'tabulator' && data.eventName === "rowSelected"){
            console.log("row selected message received.", JSON.stringify(data))
            console.log("var slide state", data.row.slideState.split(',').map(x => Number(x)))
            //post slide change to current Iframe
            currentSlide.contentWindow.postMessage(JSON.stringify({ method: 'slide', args: data.row.slideState.split(',').map(x => Number(x))}), "*");
            //send row data to OBS
            sendToOBS(data.row, "slide-changed")
        }
        
        //#endregion
        
        //
        //#region Notes message
        
        //when slides are ready get notes from the first slide
        if (data.namespace === 'reveal' && 
            ['ready'].includes(data.eventName)) {
                const currentSlide_iframe = document.getElementById("current-iframe");
                currentSlide_iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlideNotes'}), '*');
                
                //the slide iframe shouldn't open the speakerview pop up window
                currentSlide_iframe.contentWindow.postMessage(JSON.stringify({ method: 'removeKeyBinding', args: [83] }), '*');
            }
            
        //on current slide iframe  change or pause
        if (data.namespace === 'reveal' &&
            ['paused','resumed','fragmentshown','fragmenthidden','slidechanged'].includes(data.eventName)) 
            {
                console.log("Slide Changed", event)
                
                //if event 'state' doesn't equal settings 'state'
                if(JSON.stringify(data.state) != slideState){
                    slideState = JSON.stringify(data.state);
                    
                    //Get slide notes
                    const currentSlide_iframe = document.getElementById("current-iframe");
                    
                    if('slidechanged' === data.eventName){
                        currentSlide_iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlideNotes'}), '*');
                    }
                    
                    //send slide state to upcoming iFrame
                    const upcoming_iframe = document.getElementById("upcoming-iframe");
                    upcoming_iframe.contentWindow.postMessage(JSON.stringify({ method: 'slide', args: [data.state.indexh, data.state.indexv, data.state.indexf] }), '*');
                    upcoming_iframe.contentWindow.postMessage(JSON.stringify({ method: 'next'}), '*');
                    
                    //send slide state to studio table iFrame
                    const state = JSON.parse(slideState);
                    studioIframe.contentWindow.postMessage(JSON.stringify({ namespace: 'speakerview', message: 'change-row', state: state }), window.location.origin);
                }
            }
                
        //callback from get notes request
        if( data.namespace === 'reveal' && data.eventName === 'callback' && data.method === "getSlideNotes" ){
            //send slide notes to notes iFrame
            const notes_iframe = document.getElementById("notes-iframe");
            notes_iframe.contentWindow.postMessage(JSON.stringify({ namespace:"teleprompter", method: 'updateNotes', data: `${JSON.stringify(data.result)}` }), '*');
        }
        
        //on overview mode
        if (data.namespace === 'reveal' && 
            ['overviewhidden','overviewshown'].includes(data.eventName)) {
                
                //Send CustomEvent to OBS webSocket clients
                slideState = data.state;
                obsWss.call("BroadcastCustomEvent", {
                    eventData:{
                        eventName:"overview-toggled",
                        eventData: slideState,
                    }    
                });
            }  
            
        }
    
    //messages from reveal slide deck
    if(event.origin === slideDeckURL.origin && slidesLoaded == true){ 
        //read the message data
        data = JSON.parse(event.data);
        
        //#region messages from tabulator Iframe
        //when a row in the tabulator is selected, send the row data to the current slide iframe
        if (data.namespace === 'tabulator' && data.eventName === "rowSelected"){
            console.log("row selected message received.", JSON.stringify(data))
            console.log("var slide state", data.row.slideState.split(','))
            //post slide change to current Iframe
            currentSlide.contentWindow.postMessage(JSON.stringify({ method: 'slide', args: data.row.slideState.split(',')}), slideDeckURL.origin);
            //send row data to OBS
            sendToOBS(data.row, "slide-changed")
        }
        
        //#endregion
        
        //
        //#region Notes message
        
        //when slides are ready get notes from the first slide
        if (data.namespace === 'reveal' && 
            ['ready'].includes(data.eventName)) {
                const currentSlide_iframe = document.getElementById("current-iframe");
                currentSlide_iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlideNotes'}), slideDeckURL.origin);
                
                //the slide iframe shouldn't open the speakerview pop up window
                currentSlide_iframe.contentWindow.postMessage(JSON.stringify({ method: 'removeKeyBinding', args: [83] }), slideDeckURL.origin);
            }
            
        //on current slide iframe  change or pause
        if (data.namespace === 'reveal' &&
            ['paused','resumed','fragmentshown','fragmenthidden','slidechanged'].includes(data.eventName)) {
                console.log("Slide Changed", event)
                
                //if event 'state' doesn't equal settings 'state'
                if(JSON.stringify(data.state) != slideState){
                    slideState = JSON.stringify(data.state);
                    
                    //Get slide notes
                    const currentSlide_iframe = document.getElementById("current-iframe");
                    
                    if('slidechanged' === data.eventName){
                        currentSlide_iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlideNotes'}), slideDeckURL.origin);
                    }
                    
                    //send slide state to upcoming iFrame
                    const upcoming_iframe = document.getElementById("upcoming-iframe");
                    upcoming_iframe.contentWindow.postMessage(JSON.stringify({ method: 'slide', args: [data.state.indexh, data.state.indexv, data.state.indexf] }), slideDeckURL.origin);
                    upcoming_iframe.contentWindow.postMessage(JSON.stringify({ method: 'next'}), slideDeckURL.origin);
                    
                    //send slide state to studio table iFrame
                    const state = JSON.parse(slideState);
                    studioIframe.contentWindow.postMessage(JSON.stringify({ namespace: 'speakerview', message: 'change-row', state: state }), window.location.origin);
                }
            }
        
        //callback from get notes request
        if( data.namespace === 'reveal' && data.eventName === 'callback' && data.method === "getSlideNotes" ){
            console.log(data)
            //send slide notes to notes iFrame
            const notes_iframe = document.getElementById("notes-iframe");
            notes_iframe.contentWindow.postMessage(JSON.stringify({ namespace:"teleprompter", method: 'updateNotes', data: `${JSON.stringify(data.result)}` }), '*');
        }
        
        //on overview mode
        if (data.namespace === 'reveal' && 
            ['overviewhidden','overviewshown'].includes(data.eventName)) {
                
                //Send CustomEvent to OBS webSocket clients
                slideState = data.state;
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
        //do something with message from OBS
    });

function sendToOBS(msgParam, eventName) {
    console.log("sending message:", JSON.stringify(msgParam));
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