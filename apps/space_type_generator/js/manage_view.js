  
//load p5 on DOMContentLoaded
// window.addEventListener('DOMContentLoaded', async () => {
//   //on page load get query paramater
//   getParams();
// })

function getParams(){
  const params = new URLSearchParams(window.location.search)
  if(params.has("preset")){
    document.getElementById("loadSelect").value = `${params.get("preset")}.json`
    loadSettings()  
    hideui()
  }else{
    console.log("add a preset parameter")
  }
}
    
function hideui(){
  try{
    //control the p5 draw loop
    hideCanvasUI = true;

    //hide all body elements except main and script elements
    const bodyElements = document.querySelectorAll('body > *:not(main):not(script):not(canvas)');

    bodyElements.forEach(element => {
      element.style.display = "none";;
    });
  }catch(err){
    console.log("error hiding ui", err)
  }
}