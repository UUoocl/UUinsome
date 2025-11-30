//Messages from iframes in this page
//Run these functions while the slides iframe is loading
//stop if the message is not from this site or the slides iframe has loaded
console.log("message received from currentSlide", event);
window.addEventListener("message", async (event) => {
  if (event.origin !== window.location.origin || slidesLoaded == true) {
    return;
  }

  let data = JSON.parse(event.data);
  //console.log(data)

	//on request from tabulator iframe for slide data
	//return slideArray variable. 
  if (data.namespace === "tabulator" && data.message === "slides-data") {
    console.log("got the slide data request");
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

		//this will trigger the getslide event
    // currentSlide.contentWindow.postMessage(
    //   JSON.stringify({ method: "slide", args: [0, 0] }),
    //   window.location.origin
    // );

    addSlideToSlideArray(presentSlide(), data)
    
    //Get slide 1 attributes when deck is ready
    // const iframe = document.getElementById("current-iframe");
    // const iframeDocument = iframe.contentDocument;
    // // Access a specific element by ID within the iframe
    // const currentEl = iframeDocument.slidesEl.querySelector(".present");    
    // console.log("iframe current element", currentEl)
    // addElementToSlideArray(currentEl, data);

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
console.log("slidesProgress",slidesProgress)
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
      if(slidesProgress === 0){
        //get first slide
        
      }
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
    console.log("currentEl", data.state, presentSlide())
    addSlideToSlideArray(presentSlide(), data);
    // currentSlide.contentWindow.postMessage(
    // JSON.stringify({ method: "getProgress" }),
    // window.location.origin
  // );
  }
//get next fragment
  if (
    data.namespace === "reveal" &&
    slidesLoaded === false &&
    tableLoaded === false &&
    data.eventName === "fragmentshown"
  ) {
    console.log("currentEl", data.state, presentSlide())
    //addSlideToSlideArray(presentSlide(), data);
    currentSlide.contentWindow.postMessage(
      JSON.stringify({ method: "getProgress" }),
      window.location.origin
    );
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
  console.log("function data", data)
  console.log("slide element", slideEl);
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

  const isFragment =
    data.state.indexf !== undefined ? data.state.indexf : false;

  let state = `${data.state.indexh},${data.state.indexv}`;
  //get all the fragments
  if (isFragment === -1) {
    const children = [];
    const fragments = slideEl.querySelectorAll(".fragment");
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
  console.log("slides array",slidesArray)
  currentSlide.contentWindow.postMessage(
    JSON.stringify({ method: "getProgress" }),
    window.location.origin
  );
  // currentSlide.contentWindow.postMessage(JSON.stringify({ method: 'getSlidesAttributes' }), '*');
}

async function getSlideDataAttributeValue(element, dataAttribute) {
  //parser to convert String to HTML Element object
  // const parser = new DOMParser();
  // const slideElement = parser.parseFromString(element, "text/html");
  //if querySelector is nullish, then set the value to an empty string
  const getEl = element.querySelector(`[${dataAttribute}]`) ?? "";
  return getEl ? getEl.getAttribute(dataAttribute) : "";
}

async function getFragmentDataAttributeValue(element, dataAttribute) {
  return element ? element.getAttribute(dataAttribute) : "";
}
