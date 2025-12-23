const graph = new LGraph();
const canvas = new LGraphCanvas("#mainCanvas", graph);

// Wait for the specific OBS event to start the app
obsWss.on("Identified", () => {
    console.log("OBS Identified! Initializing Flows...");
    document.getElementById('status').innerText = "Connected";
    document.getElementById('status').className = "connected";
    
    // Start the graph engine
    graph.start();
});

// --- CUSTOM LITEGRAPH NODES ---

// 1. Event Node: Scene Changed
function OnSceneChange() {
    this.addOutput("Trigger", LiteGraph.EVENT);
    this.addOutput("Name", "string");
    
    // Store reference to trigger later
    obsWss.on('CurrentProgramSceneChanged', (data) => {
        this.setOutputData(1, data.sceneName);
        this.triggerSlot(0);
    });
}
OnSceneChange.title = "On Scene Change";
LiteGraph.registerNodeType("obs/on_scene_change", OnSceneChange);

// 2. Action Node: Set Scene
function SetScene() {
    this.addInput("Trigger", LiteGraph.ACTION);
    this.addInput("Scene Name", "string");
    this.properties = { scene: "" };
    this.addWidget("text", "Scene", "", (v) => this.properties.scene = v);
}
SetScene.title = "Set Scene";
SetScene.prototype.onAction = function(action, param) {
    const sceneName = this.getInputData(1) || this.properties.scene;
    if (sceneName) {
        obsWss.call('SetCurrentProgramScene', { sceneName });
    }
};
LiteGraph.registerNodeType("obs/set_scene", SetScene);

// --- SAVE / LOAD LOGIC ---

async function saveFlow() {
    const name = document.getElementById('flowName').value;
    const data = graph.serialize();
    await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data })
    });
}

async function loadFlow() {
    const name = document.getElementById('flowName').value;
    const response = await fetch(`/api/load/${name}`);
    if (response.ok) {
        const data = await response.json();
        graph.configure(data);
    }
}

window.addEventListener("resize", () => canvas.resize());