
const fullPath = window.location.pathname;
//get filename
let filename = fullPath.substring(fullPath.lastIndexOf("/") + 1);
// Remove the file extension
filename = filename.substring(0, filename.lastIndexOf(".")) || filename;
const saveStyle = document.createElement('style');

// Define your CSS rules as a string
const cssSave = `
  #obsidian-save-ui-layer {
    position: absolute;
    top: 0;
    left: 200px;
    right: 0;
    height: 40px;
    background: #33333301;
    border-bottom: 1px solid #444;
    display: flex;
    align-items: center;
    padding: 0 10px;
    gap: 10px;
    z-index: 0;
  }
`;

// Add the CSS string to the style element
saveStyle.appendChild(document.createTextNode(cssSave));


// Append the style element to the head
document.head.appendChild(saveStyle);

const newDiv = document.createElement('div');
newDiv.id = 'obsidian-save-ui-layer';
newDiv.innerHTML = `<span>Settings Name</span>
    <input type="text" id="settingsName" placeholder="My Settings" value="${filename}_settings">
    <button onclick="saveSettings()">Save</button>
    <select id="loadSelect"><option>Loading...</option></select>
    <button onclick="loadSettings()">Load</button>`;

// 2. Prepend the new element to the body
document.body.prepend(newDiv);


// --- Save / Load Logic  ---
const APP_FOLDER = "apps/space_type_generator/presets";

window.saveSettings = async () => {
  const name =
    document.getElementById("settingsName").value || "untitled_settings";

  const data = getSketchSettings(filename);

  try {
    // Updated Endpoint: /api/file/save
    const response = await fetch("/api/file/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder: APP_FOLDER,
        filename: name,
        data: data,
      }),
    });
    const res = await response.json();
    if (res.success) {
      //alert("Settings saved!");
      refreshLoadList();
    } else {
      alert("Error: " + res.error);
    }
  } catch (e) {
    alert("Server Error during Save");
  }
};

window.loadSettings = async () => {
  const select = document.getElementById("loadSelect");
  const filename = select.value;
  if (!filename) return;

  try {
    // Updated Endpoint: /api/file/get with query params
    const response = await fetch(
      `/api/file/get?folder=${APP_FOLDER}&filename=${filename}`
    );
    if (!response.ok) throw new Error("File not found");

    const json = await response.json();

    //do something with returned file
    setSketchSettings(json);

    //alert("Settings loaded");
    document.getElementById("settingsName").value = filename.replace(
      ".json",
      ""
    );
  } catch (e) {
    console.error(e);
    alert("Error loading settings");
  }
};

async function refreshLoadList() {
  try {
    // Updated Endpoint: /api/file/list with query param
    const response = await fetch(`/api/file/list?folder=${APP_FOLDER}`);
    const files = await response.json();
    const select = document.getElementById("loadSelect");
    if (select) {
        //clear options
        select.innerHTML = "";
        
        //add default option
        const opt1 = document.createElement("option");
        opt1.value = "select";
        opt1.innerText = "select";
        opt1.disabled = true
        select.appendChild(opt1);
        select.value = "select"
        
        //add saved presets
        files.forEach((f) => {
        const opt = document.createElement("option");
        opt.value = f;
        opt.innerText = f;
        select.appendChild(opt);
        });

    }
  } catch (e) {
    console.error("Could not fetch list", e);
  }
}

refreshLoadList();
