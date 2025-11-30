
//on slide change, get slide attributes
window.addEventListener('message', async (event) => {
    if(event.origin === slideDeckURL.origin && slidesLoaded){  
        let data = JSON.parse(event.data);
        
        //get Slides and Fragments
        if (data.namespace === 'reveal' && 
            ['fragmentshown','fragmenthidden','slidechanged'].includes(data.eventName)) {
            console.log("Slide Changed", data)
            
            slideState = data.state;
            slideState.indexf = data.state.indexf ?? '';
            console.log( slideState )

            //Get slides attributes
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlide', args: [ slideState.indexh, slideState.indexv ] }), '*');
        }
        
        //select table row where ID = SlideId
        if( data.namespace === 'reveal' && data.eventName === 'callback' && data.method === "getSlide" ){
            console.log("get row", data)
            //slide HTML is returned in string format
            const slide = data.result.originalSlideHTML;
            
            //parser to convert String to HTML Element object  
            const parser = new DOMParser();
            const slideEl = parser.parseFromString(slide,  "text/html")
            let slideId = slideEl.querySelector('[data-id]').getAttribute('data-id')
            
            console.log("returned Slide data", slideId)
            selectTableRow(slideId);
        }        
    }
})
    
//for each table column value, send command to OBS
    function selectTableRow(slideId){
        
        let row = table.searchData("slideId", "=", slideId);
        let rowComponent = table.searchRows("slideId", "=", slideId);
        console.log(row[0])
        console.log(rowComponent[0].getIndex())
        console.log(rowComponent[0].getPosition())
        console.log(typeof slideState.indexf)
        table.deselectRow();
        table.selectRow(table.getRowFromPosition(rowComponent[0].getPosition()));
 
        table.scrollToRow(rowComponent[0], "top")
        if(typeof slideState.indexf === 'number' && slideState.indexf > -1){
            let children = rowComponent[0].getTreeChildren()
            console.log(children)
            const fragmentRow = children.filter(row => Number(row._row.data.slideId) == slideState.indexf)
            console.log(fragmentRow)
            table.selectRow(table.getRowFromPosition(fragmentRow[0].getPosition()));
            const rowData = fragmentRow[0].getData();
            filterRowData(rowData);
        }else{
            const rowData = rowComponent[0].getData();
            filterRowData(rowData);
        }
    }
        
    function filterRowData(rowData){
        //slide navigation
        console.log("send this", rowData);

        // Filter the object
        const filteredRowData = {}
        filteredRowData.result = Object.fromEntries(
            Object.entries(rowData).filter(([key, value]) => value)
        );
        // filteredRowData.namespace = "reveal";
        // filteredRowData.eventName = "callback";
        // filteredRowData.method = "getSlidesAttributes";
        filteredRowData.state = slideState;
        
        console.log("filtered", filteredRowData)
        sendToOBS(filteredRowData, "slide-changed");
    }

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