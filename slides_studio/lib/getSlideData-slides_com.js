console.log("getSlideData slides.com loaded");
//Message from Reveal Slides currentSlide API
window.addEventListener("message", async (event) => {
	//only run if reveal deck has not been processed
	//only get the slide data once.  
	//TOdo remove listener after slide data is processed,
	//test fragments  
	if (event.origin !== "https://slides.com" || slidesLoaded == true) {
		return;
	}
	
	console.log("message received from currentSlide", event);
	let data = JSON.parse(event.data);
	
	//on request from tabulator iframe for slide data
	//return slideArray variable. 
    if(data.namespace === "tabulator" && data.message === "slides-data"){
		console.log("got the slide data request")
        studioIframe.contentWindow.postMessage(JSON.stringify({ message:'slides-data-response', slidesData: slidesArray, namespace: 'speakerview'}), window.location.origin);
    }
	
	//on reveal slides 'ready' start the get Slides and Fragments process 
	if (data.namespace === "reveal" && data.eventName === 'ready') {
		console.log("Slides ready");
		slidesArray = [];
		
		//this will trigger the getslide event
		currentSlide.contentWindow.postMessage(
			JSON.stringify({ method: "getSlide", args: [0, 0] }),
			"https://slides.com"
		);	
	}

	if (
		data.namespace === "reveal" &&
		data.eventName === "callback" &&
		data.method === "getProgress" &&
		tableLoaded == false  && 
		slidesLoaded === false) {
	
		const slidesProgress = data.result;
	
		if (slidesProgress === 1) {
			tableLoaded = true;
			slidesLoaded = true;
			currentSlide.contentWindow.postMessage(
				JSON.stringify({ method: "slide", args: [0, 0] }),
				"https://slides.com"
			);
			//send to data table iframe
			studioIframe.contentWindow.postMessage(JSON.stringify({ message:'slides-data-response', slidesData: slidesArray, namespace: 'speakerview'}), window.location.origin);
		} else {
			//get next slide
			currentSlide.contentWindow.postMessage(
				JSON.stringify({ method: "next" }),
				"https://slides.com"
			);
		}
	}

	//callback from get slides request
	if (
		data.namespace === "reveal" &&
		data.eventName === "callback" &&
		data.method === "getSlide" &&
		tableLoaded === false && 
        slidesLoaded === false
	) {
		console.log(event);
		//slides HTML is returned in string format
		const slide = data.result;
		//parser to convert String to HTML Element object
		const parser = new DOMParser();

		const slideEl = parser.parseFromString(
			slide.originalSlideHTML,
			"text/html"
		);
		//Get slide id
		const slideId = await getSlideElementAttributeValue(slideEl, "data-id");

		const slideName = await getSlideElementAttributeValue(
			slideEl,
			"data-slide-name"
		);

		const slidePosition = await getSlideElementAttributeValue(
			slideEl,
			"data-slide-position"
		);

		const cameraPosition = await getSlideElementAttributeValue(
			slideEl,
			"data-camera-position"
		);

		const cameraShape = await getSlideElementAttributeValue(
			slideEl,
			"data-camera-shape"
		);
		
		const scene = await getSlideElementAttributeValue(
			slideEl,
			"data-scene"
		);

		const isFragment =
			data.state.indexf !== undefined ? data.state.indexf : false;

		let state = `${data.state.indexh},${data.state.indexv}`;

		//get all the fragments
		if (isFragment === -1) {
			const children = [];
			const fragments = slideEl.querySelectorAll(".fragment");
			console.log("fragment count", fragments.length);
			for (let f_index = 0; f_index < fragments.length; f_index++) {
				const fragment = fragments[f_index];

				const fragmentId = await getFragmentDataAttributeValue(
					fragment,
					"data-fragment-index"
				);

				const fragmentState = `${data.state.indexh},${data.state.indexv},${fragmentId}`;

				const slideName = await getFragmentDataAttributeValue(
					fragment,
					"data-fragment-name"
				);

				const slidePosition = await getFragmentDataAttributeValue(
					fragment,
					"data-fragment-position"
				);

				const cameraPosition = await getFragmentDataAttributeValue(
					fragment,
					"data-fragment-camera-position"
				);

				const cameraShape = await getFragmentDataAttributeValue(
					fragment,
					"data-fragment-camera-shape"
				);

				const scene = await getFragmentDataAttributeValue(
					fragment,
					"data-fragment-scene"
				);

				const fragmentDetails = {
					slideId: `${fragmentId}`,
					slideState: fragmentState,
					slideName: slideName,
					slidePosition: slidePosition,
					cameraPosition: cameraPosition,
					cameraShape: cameraShape,
					scene: scene,
                    
				};
				const result = children.find(
					({ slideId }) => slideId === `${fragmentId}`
				);
				console.log(result);
				if (typeof result != "object") {
					children.push(fragmentDetails);
				}
			}
			const slideDetails = {
				slideId: slideId,
				slideState: state,
				slideName: slideName,
				slidePosition: slidePosition,
				cameraPosition: cameraPosition,
				cameraShape: cameraShape,
				scene: scene,
                
				_children: children,
			};
			slidesArray.push(slideDetails);
		}

		if (isFragment === false) {
			const slideDetails = {
				slideId: slideId,
				slideState: state,
				slideName: slideName,
				slidePosition: slidePosition,
				cameraPosition: cameraPosition,
				cameraShape: cameraShape,
				scene: scene,
                
				// _children: children
			};
			slidesArray.push(slideDetails);
		}

		currentSlide.contentWindow.postMessage(
			JSON.stringify({ method: "getProgress" }),
			"https://slides.com"
		);
	}


	if (
		data.namespace === "reveal" && slidesLoaded === false && tableLoaded === false &&
		["fragmentshown", "fragmenthidden", "slidechanged"].includes(
			data.eventName
		)
	) {
		slideState = data.state;
		slideState.indexf = data.state.indexf ?? "";
		console.log(slideState);

		//Get slides attributes
		currentSlide.contentWindow.postMessage(
			JSON.stringify({
				method: "getSlide",
				args: [slideState.indexh, slideState.indexv],
			}),
			"https://slides.com"
		);
	}
});

async function getSlideElementAttributeValue(element, dataAttribute) {
	//if querySelector is nullish, then set the value to an empty string
	const getEl = element.querySelector(`[${dataAttribute}]`) ?? "";

	return getEl ? getEl.getAttribute(dataAttribute) : "";
}

function getSlide() {
	console.log("calling get slide");
	currentSlide.contentWindow.postMessage(
		JSON.stringify({ method: "getSlide" }),
		"https://slides.com"
	);
}

async function getFragmentDataAttributeValue(element, dataAttribute){
   return element ? element.getAttribute(dataAttribute): "";
}
