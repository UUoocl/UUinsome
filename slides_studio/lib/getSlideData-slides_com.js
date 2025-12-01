//Message from Reveal Slides currentSlide API
window.addEventListener("message", async (event) => {
	//only run if reveal deck has not been processed
	//only get the slide data once.  
	if (event.origin !== "https://slides.com" || slidesLoaded == true) {
		return;
	}

	let data = JSON.parse(event.data);
	
	//on request from tabulator iframe for slide data
	//return slideArray variable. 
    if(data.namespace === "tabulator" && data.message === "slides-data"){
        studioIframe.contentWindow.postMessage(
			JSON.stringify({ 
				message:'slides-data-response', 
				slidesData: slidesArray, 
				namespace: 'speakerview'
			}), 
			window.location.origin
		);
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

    //when slide deck progress equals 1, end the get slide process
	if (
		data.namespace === "reveal" &&
		data.eventName === "callback" &&
		data.method === "getProgress" &&
		tableLoaded == false  && 
		slidesLoaded === false
	) {
	  // find current slide attributes
		const slidesProgress = data.result;
		if (slidesProgress === 1) {
			tableLoaded = true;
			slidesLoaded = true;
			currentSlide.contentWindow.postMessage(
				JSON.stringify({ method: "slide", args: [0, 0] }),
				"https://slides.com"
			);
			//send to data table iframe
			studioIframe.contentWindow.postMessage(
				JSON.stringify({ 
					message:'slides-data-response', 
					slidesData: slidesArray, 
					namespace: 'speakerview'
				}), 
				window.location.origin
			);
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
		//slides HTML is returned in string format
		const slide = data.result;
		//parser to convert String to HTML Element object
		const parser = new DOMParser();
		
		const slideEl = parser.parseFromString(
			slide.originalSlideHTML,
			"text/html"
		);
		
		//Get slide id
		const slideId = await getSlideElementAttributeValue(
			slideEl, 
			"data-id"
		);

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

		let state = `${data.state.indexh},${data.state.indexv}`;
		// const isFragment =
		// 	data.state.indexf !== undefined ? data.state.indexf : false;


		// //get all the fragments
		// if (data.state.indexf !== undefined) {
		// // console.log("data results",data)
		// // console.log("getslide result",slideEl);
		
		// 	const children = [];
		// 	const fragments = slideEl.querySelectorAll(".fragment");
		// 	console.log("fragment count", fragments.length);
		// 	for (let f_index = 0; f_index < fragments.length; f_index++) {
		// 		const fragment = fragments[f_index];

		// 		const fragmentId = await getFragmentDataAttributeValue(
		// 			fragment,
		// 			"data-fragment-index"
		// 		);

		// 		const fragmentState = `${data.state.indexh},${data.state.indexv},${fragmentId}`;

		// 		const slideName = await getFragmentDataAttributeValue(
		// 			fragment,
		// 			"data-fragment-name"
		// 		);

		// 		const slidePosition = await getFragmentDataAttributeValue(
		// 			fragment,
		// 			"data-fragment-position"
		// 		);

		// 		const cameraPosition = await getFragmentDataAttributeValue(
		// 			fragment,
		// 			"data-fragment-camera-position"
		// 		);

		// 		const cameraShape = await getFragmentDataAttributeValue(
		// 			fragment,
		// 			"data-fragment-camera-shape"
		// 		);

		// 		const scene = await getFragmentDataAttributeValue(
		// 			fragment,
		// 			"data-fragment-scene"
		// 		);

		// 		const fragmentDetails = {
		// 			slideId: `${fragmentId}`,
		// 			slideState: fragmentState,
		// 			slideName: slideName,
		// 			slidePosition: slidePosition,
		// 			cameraPosition: cameraPosition,
		// 			cameraShape: cameraShape,
		// 			scene: scene,
                    
		// 		};
		// 		const result = children.find(
		// 			({ slideId }) => slideId === `${fragmentId}`
		// 		);
		// 		// console.log(result);
		// 		if (typeof result != "object") {
		// 			children.push(fragmentDetails);
		// 		}
		// 	}
		// 	const slideDetails = {
		// 		slideId: slideId,
		// 		slideState: state,
		// 		slideName: slideName,
		// 		slidePosition: slidePosition,
		// 		cameraPosition: cameraPosition,
		// 		cameraShape: cameraShape,
		// 		scene: scene,
                
		// 		// _children: children,
		// 	};
		// 	slidesArray.push(slideDetails);
		// }

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
	

		currentSlide.contentWindow.postMessage(
			JSON.stringify({ method: "getProgress" }),
			"https://slides.com"
		);
	}


	// new logic 
	// if slidechanged then getSlide
	// if fragmentshown or fragmenthidden then append to slidearray 
	if (
		data.namespace === "reveal" &&
		 slidesLoaded === false && 
		 tableLoaded === false &&
		data.eventName === "slidechanged"
	) {
		slideState = data.state;
		
		//Get slides attributes
		currentSlide.contentWindow.postMessage(
			JSON.stringify({
				method: "getSlide",
				args: [slideState.indexh, slideState.indexv],
			}),
			"https://slides.com"
		);
	}
	
	if (
		data.namespace === "reveal" &&
		slidesLoaded === false && 
		tableLoaded === false &&
		["fragmentshown", "fragmenthidden"].includes(
			data.eventName
		)	
	){
		addFragmentToSlideArray(data);
	}
});

async function getSlideElementAttributeValue(element, dataAttribute) {
	//if querySelector is nullish, then set the value to an empty string
	const getEl = element.querySelector(`[${dataAttribute}]`) ?? "";
	return getEl ? getEl.getAttribute(dataAttribute) : "";
}

async function getFragmentDataAttributeValue(element, dataAttribute){
   return element ? element.getAttribute(dataAttribute): "";
}

async function addFragmentToSlideArray(data) {
// get fragment
  const slideToFind = `${data.state.indexh},${data.state.indexv}`;
  const foundSlide = slidesArray.find(slide => slide.slideState === slideToFind);
  const fragment = {}

  if (foundSlide) {
    if (!foundSlide.hasOwnProperty("_children")) {
      foundSlide._children = []; // Initialize as an empty array if property doesn't exist
    }
    fragment.slideState = `${data.state.indexh},${data.state.indexv},${data.state.indexf}`;
    
    foundSlide._children.push(fragment);// push the fragment to the children property
  } else {
    console.log(`Slide with ID ${slideToFind} not found.`);
  }
  currentSlide.contentWindow.postMessage(
    JSON.stringify({ method: "getProgress" }),
    "https://slides.com"
  );
}