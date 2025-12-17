//Messages from iframes in this page
//Run these functions while the slides iframe is loading
//stop if the message is not from this site or the slides iframe has loaded

window.addEventListener("message", async (event) => {
  if (event.origin !== window.location.origin || slidesLoaded == true) {
    return;
  }

  let data = JSON.parse(event.data);

	//on request from tabulator iframe for slide data
	//return slideArray variable. 
  if (data.namespace === "tabulator" && data.message === "slides-data") {
    studioIframe.contentWindow.postMessage(
      JSON.stringify({
        message: "slides-data-response",
        slidesData: slidesArray,
        namespace: "speakerview",
      }),
      window.location.origin
    );
  }

	//on reveal slides 'ready' start the get Slides and Fragments process 
  if (data.namespace === "reveal" && data.eventName === "ready") {
    console.log("Slides ready");
    slidesArray = [];

    addSlideToSlideArray(presentSlide(), data)

  }

  //when slide deck progress equals 1, end the get slide process
  if (
    data.namespace === "reveal" &&
    data.eventName === "callback" &&
    data.method === "getProgress" &&
    tableLoaded == false &&
    slidesLoaded === false
  ) {
    // find current slide attributes
    const slidesProgress = data.result;
    if (slidesProgress === 1) {
      tableLoaded = true;
      slidesLoaded = true;
      currentSlide.contentWindow.postMessage(
        JSON.stringify({ method: "slide", args: [0, 0] }),
        window.location.origin
      );
      //send to data table iframe
      studioIframe.contentWindow.postMessage(
        JSON.stringify({
          message: "slides-data-response",
          slidesData: slidesArray,
          namespace: "speakerview",
        }),
        window.location.origin
      );
    } else {
      //get next slide
      currentSlide.contentWindow.postMessage(
        JSON.stringify({ method: "next" }),
        window.location.origin
      );
    }
  }

//get next slide
  if (
    data.namespace === "reveal" &&
    slidesLoaded === false &&
    tableLoaded === false &&
    data.eventName === "slidechanged"
  ) {
    addSlideToSlideArray(presentSlide(), data);
    }
    
    //get next fragment
    if (
      data.namespace === "reveal" &&
      slidesLoaded === false &&
      tableLoaded === false &&
      ["fragmentshown","fragmenthidden"].includes(data.eventName)
    ) {
      // console.log("currentEl", data.state, presentSlide())
      addFragmentToSlideArray(presentSlide(), data);
    }
  });

let presentSlide = () =>{
  let slideEl = currentSlide.contentDocument.querySelector('.present')
  if (slideEl.classList.contains('stack')) {
      // The element has the 'stack' class, get the presemt v slide 
      slideEl = currentSlide.contentDocument.querySelector('.present .present')
  }
  return slideEl
}

async function addSlideToSlideArray(slideEl, data) {
  //Get slide id
  const slideId = await getSlideDataAttributeValue(
    slideEl,
    "data-id"
  );

  const slideName = await getSlideDataAttributeValue(
    slideEl,
    "data-slide-name"
  );

  const slidePosition = await getSlideDataAttributeValue(
    slideEl,
    "data-slide-position"
  );

  const cameraPosition = await getSlideDataAttributeValue(
    slideEl,
    "data-camera-position"
  );

  const cameraShape = await getSlideDataAttributeValue(
    slideEl,
    "data-camera-shape"
  );

  const scene = await getSlideDataAttributeValue(
    slideEl,
    "data-scene"
  );

  let state = `${data.state.indexh},${data.state.indexv}`;

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
  
  // console.log("slides array",slidesArray)
  currentSlide.contentWindow.postMessage(
    JSON.stringify({ method: "getProgress" }),
    window.location.origin
  );
  // currentSlide.contentWindow.postMessage(JSON.stringify({ method: 'getSlidesAttributes' }), '*');
}


async function addFragmentToSlideArray(slideEl, data) {
// get fragment
  const slideToFind = `${data.state.indexh},${data.state.indexv}`;
  const foundSlide = slidesArray.find(slide => slide.slideState === slideToFind);
  const fragment = {}
  
  if (foundSlide) {
    if (!foundSlide.hasOwnProperty("_children")) {
      foundSlide._children = []; // Initialize as an empty array if property doesn't exist
    }
    const fragmentEl = slideEl.querySelector('.current-fragment')
    
    fragment.slideState = `${data.state.indexh},${data.state.indexv},${await getFragmentDataAttributeValue(
      slideEl,
      "data-fragment"
    )}`;

    fragment.slideName = await getFragmentDataAttributeValue(
        fragmentEl,
        "data-fragment-name"
      );
  
    fragment.slidePosition = await getFragmentDataAttributeValue(
      fragmentEl,
      "data-fragment-position"
    );

    fragment.cameraPosition = await getFragmentDataAttributeValue(
      fragmentEl,
      "data-fragment-camera-position"
    );
    
    fragment.cameraShape = await getFragmentDataAttributeValue(
      fragmentEl,
      "data-fragment-camera-shape"
    );

    fragment.scene = await getFragmentDataAttributeValue(
      fragmentEl,
      "data-fragment-scene"
    );    
    
    foundSlide._children.push(fragment);// push the fragment to the children property
  } else {
    console.log(`Slide with ID ${slideToFind} not found.`);
  }
  currentSlide.contentWindow.postMessage(
    JSON.stringify({ method: "getProgress" }),
    window.location.origin
  );
}
                          
  async function getSlideDataAttributeValue(element, dataAttribute) {
    // check the element data attribute first
    if(element.getAttribute(dataAttribute)){
        return element.getAttribute(dataAttribute)
    }
    //if querySelector is nullish, then set the value to an empty string
    let getEl = element.querySelector(`[${dataAttribute}]`) ?? "";
    return getEl
  }
  
  async function getFragmentDataAttributeValue(element, dataAttribute) {
    return element ? element.getAttribute(dataAttribute) : "";
  }
  