let obsManager = new OBSManager();
let monitorInstances = [];
let availableSources = [];

// State
let mousePos = { x: 0, y: 0 };
let zoomLevel = 1.0;
let targetZoomLevel = 1.0;
let viewX = 0;
let viewY = 0;
let stageSize = { width: 1920, height: 1080 };
let lastInputTime = Date.now();
const IDLE_TIMEOUT = 4000; // 4 seconds

const mouseChannel = new BroadcastChannel('mouse_move');
const keyboardChannel = new BroadcastChannel('keyboard_event');
const desktopBoundsChannel = new BroadcastChannel('desktop_bounds');

let currentDesktopBounds = null;

function recordActivity() {
    lastInputTime = Date.now();
}

// Listen for bounds requests
desktopBoundsChannel.onmessage = (event) => {
    if (event.data === 'request_bounds' && currentDesktopBounds) {
        desktopBoundsChannel.postMessage(currentDesktopBounds);
    }
};

// Initialize OBS and load settings
async function initApp() {
    loadSavedSettings();
    
    obsManager.onConnectionChange = (connected) => {
        const statusEl = document.getElementById('connection-status');
        if (connected) {
            statusEl.textContent = 'Connected to OBS';
            statusEl.className = 'status connected';
            refreshData();
        } else {
            statusEl.textContent = 'Connection Failed';
            statusEl.className = 'status disconnected';
        }
    };

    await obsManager.connect();
}

async function refreshData() {
    if (!obsManager.isConnected) return;

    const monitors = await obsManager.getMonitorList();
    availableSources = await obsManager.getInputList();
    const videoSettings = await obsManager.getVideoSettings();
    stageSize = videoSettings;

    // Create monitor instances
    monitorInstances = monitors.map(mon => {
        const mapping = mappings[mon.monitorIndex] || { sourceName: '', resolutionFactor: 1.0 };
        return new Monitor(mon, mapping);
    });

    window.recalculateDesktopBounds();

    renderMappingUI();
}

window.recalculateDesktopBounds = function() {
    const activeMonitors = monitorInstances.filter(m => m.sourceName);
    
    if (activeMonitors.length > 0) {
        const minX = Math.min(...activeMonitors.map(m => m.x));
        const maxX = Math.max(...activeMonitors.map(m => m.x + m.width));
        const minY = Math.min(...activeMonitors.map(m => m.y));
        const maxY = Math.max(...activeMonitors.map(m => m.y + m.height));
        
        currentDesktopBounds = { minX, maxX, minY, maxY };
        desktopBoundsChannel.postMessage(currentDesktopBounds);
    }
};

function renderMappingUI() {
    const container = document.getElementById('monitor-mappings');
    container.innerHTML = '<h3>Monitor Mappings</h3>';
    
    monitorInstances.forEach(mon => {
        const div = document.createElement('div');
        div.className = 'monitor-mapping';
        
        div.innerHTML = `
            <h4>${mon.name} (${mon.width}x${mon.height})</h4>
            <div style="display: flex; gap: 10px; align-items: center;">
                <div style="flex: 2;">
                    <label style="font-size: 0.7em;">Source</label>
                    <select onchange="updateMapping(${mon.index}, 'sourceName', this.value)">
                        <option value="">None</option>
                        ${availableSources.map(s => `<option value="${s}" ${mon.sourceName === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 0.7em;">Res Factor</label>
                    <input type="number" step="0.1" min="0.1" value="${mon.resolutionFactor || 1.0}" 
                        onchange="updateMapping(${mon.index}, 'resolutionFactor', this.value)">
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Event Listeners
mouseChannel.onmessage = (event) => { 
    mousePos = event.data; 
    recordActivity();
};
keyboardChannel.onmessage = (event) => { 
    handleKeyboard(event.data); 
    recordActivity();
};

window.addEventListener('MouseMove', (event) => { 
    mousePos = event.detail; 
    recordActivity();
});
window.addEventListener('keyboard_event', (event) => { 
    handleKeyboard(event.detail); 
    recordActivity();
});

// P5.js Functions
function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-container');
    initApp();
}

// Browser source dimensions cache
let browserSourceDimensions = {};
let browserSourceCurrentState = {}; // Interpolated state for synced sources

window.getLayoutDimensions = function() {
    const activeMonitors = monitorInstances.filter(m => m.sourceName);
    if (activeMonitors.length === 0) return { layoutW: 0, layoutH: 0 };
    
    let layoutMinX = Math.min(...activeMonitors.map(m => m.x));
    let layoutMaxX = Math.max(...activeMonitors.map(m => m.x + m.width));
    let layoutMinY = Math.min(...activeMonitors.map(m => m.y));
    let layoutMaxY = Math.max(...activeMonitors.map(m => m.y + m.height));

    return {
        layoutW: layoutMaxX - layoutMinX,
        layoutH: layoutMaxY - layoutMinY
    };
};

async function syncBrowserSources(perimeter, layoutW, layoutH) {
    let anySourceMoving = false;

    for (const sourceName of config.syncedBrowserSources) {
        // Cache dimensions once
        if (!browserSourceDimensions[sourceName]) {
            const dims = await obsManager.getSceneItemDimensions(sourceName);
            if (dims) browserSourceDimensions[sourceName] = dims;
            else continue;
        }

        const dims = browserSourceDimensions[sourceName];
        
        // Initialize state if new
        if (!browserSourceCurrentState[sourceName]) {
            browserSourceCurrentState[sourceName] = { x: perimeter.x, y: perimeter.y, scaleX: perimeter.w / dims.width, scaleY: perimeter.h / dims.height };
        }

        const targetState = {
            x: perimeter.x,
            y: perimeter.y,
            scaleX: perimeter.w / dims.width,
            scaleY: perimeter.h / dims.height
        };

        const state = browserSourceCurrentState[sourceName];
        const prevX = state.x;
        const prevY = state.y;
        const prevScaleX = state.scaleX;

        if (config.movementType === 'smooth') {
            state.x = lerp(state.x, targetState.x, config.movementSpeed);
            state.y = lerp(state.y, targetState.y, config.movementSpeed);
            state.scaleX = lerp(state.scaleX, targetState.scaleX, config.movementSpeed);
            state.scaleY = lerp(state.scaleY, targetState.scaleY, config.movementSpeed);

            // Snap
            if (Math.abs(state.x - targetState.x) < 0.1) state.x = targetState.x;
            if (Math.abs(state.y - targetState.y) < 0.1) state.y = targetState.y;
            if (Math.abs(state.scaleX - targetState.scaleX) < 0.001) state.scaleX = targetState.scaleX;
            if (Math.abs(state.scaleY - targetState.scaleY) < 0.001) state.scaleY = targetState.scaleY;
        } else {
            state.x = targetState.x;
            state.y = targetState.y;
            state.scaleX = targetState.scaleX;
            state.scaleY = targetState.scaleY;
        }

        const moved = (prevX !== state.x || prevY !== state.y || prevScaleX !== state.scaleX);
        if (moved) {
            anySourceMoving = true;
            obsManager.updateSceneItemTransform(sourceName, state.x, state.y, state.scaleX, state.scaleY);
        }
    }
    return anySourceMoving;
}

function draw() {
    clear();
    
    let visualScale = min(width / stageSize.width, height / stageSize.height) * 0.8;
    push();
    translate(width / 2, height / 2);
    scale(visualScale);
    translate(-stageSize.width / 2, -stageSize.height / 2);

    // OBS Stage Fill White
    fill(255);
    stroke(100);
    strokeWeight(2);
    rect(0, 0, stageSize.width, stageSize.height);

    if (config.movementType === 'smooth') {
        zoomLevel = lerp(zoomLevel, targetZoomLevel, config.movementSpeed);
    } else {
        zoomLevel = targetZoomLevel;
    }

    const stageCenterX = stageSize.width / 2;
    const stageCenterY = stageSize.height / 2;
    const bbHalf = config.boundingBoxSize / 2;

    const activeMonitors = monitorInstances.filter(m => m.sourceName);
    let sourcesAreMoving = false;
    const timeSinceLastInput = Date.now() - lastInputTime;
    const isWithinActiveWindow = timeSinceLastInput < IDLE_TIMEOUT;

    if (activeMonitors.length > 0) {
        let layoutMinX = Math.min(...activeMonitors.map(m => m.x));
        let layoutMaxX = Math.max(...activeMonitors.map(m => m.x + m.width));
        let layoutMinY = Math.min(...activeMonitors.map(m => m.y));
        let layoutMaxY = Math.max(...activeMonitors.map(m => m.y + m.height));

        const layoutW = layoutMaxX - layoutMinX;
        const layoutH = layoutMaxY - layoutMinY;

        let targetViewX = mousePos.x - stageCenterX;
        let targetViewY = mousePos.y - stageCenterY;

        let followX = (layoutW * zoomLevel) > stageSize.width;
        let followY = (layoutH * zoomLevel) > stageSize.height;

        const visibleHalfW = stageCenterX / zoomLevel;
        const visibleHalfH = stageCenterY / zoomLevel;

        if (followX) {
            if (Math.abs(targetViewX - viewX) > bbHalf) {
                viewX = targetViewX - Math.sign(targetViewX - viewX) * bbHalf;
            }
            if (Math.abs(targetViewX - viewX) > visibleHalfW) {
                viewX = targetViewX - Math.sign(targetViewX - viewX) * visibleHalfW;
            }
        } else {
            viewX = (layoutMinX + layoutMaxX) / 2 - stageCenterX;
        }

        if (followY) {
            if (Math.abs(targetViewY - viewY) > bbHalf) {
                viewY = targetViewY - Math.sign(targetViewY - viewY) * bbHalf;
            }
            if (Math.abs(targetViewY - viewY) > visibleHalfH) {
                viewY = targetViewY - Math.sign(targetViewY - viewY) * visibleHalfH;
            }
        } else {
            viewY = (layoutMinY + layoutMaxY) / 2 - stageCenterY;
        }

        // Strictly enforce Outer Perimeter rules:
        // Must always cover the OBS Stage.
        const limitX1 = layoutMinX - stageCenterX + stageCenterX / zoomLevel;
        const limitX2 = layoutMaxX - stageCenterX - stageCenterX / zoomLevel;
        const limitY1 = layoutMinY - stageCenterY + stageCenterY / zoomLevel;
        const limitY2 = layoutMaxY - stageCenterY - stageCenterY / zoomLevel;

        // If the layout is larger than the stage at the current zoom, clamp viewX/Y
        if (limitX1 <= limitX2) {
            viewX = Math.max(limitX1, Math.min(limitX2, viewX));
        } else {
            // If smaller, center the layout (this violates the "must cover" rule, 
            // but is the only logical fallback if zoom is too low)
            viewX = (layoutMinX + layoutMaxX) / 2 - stageCenterX;
        }

        if (limitY1 <= limitY2) {
            viewY = Math.max(limitY1, Math.min(limitY2, viewY));
        } else {
            viewY = (layoutMinY + layoutMaxY) / 2 - stageCenterY;
        }

        // Update and draw monitors
        activeMonitors.forEach(mon => {
            const moved = mon.update(zoomLevel, viewX, viewY, stageCenterX, stageCenterY, config.movementType, config.movementSpeed);
            if (moved) sourcesAreMoving = true;
            mon.draw(zoomLevel);
            
            // Send OBS update only if moving OR recently active
            if (moved || isWithinActiveWindow) {
                obsManager.updateSceneItemTransform(mon.sourceName, mon.currentState.x, mon.currentState.y, mon.currentState.scale, mon.currentState.scale);
            }
        });

        // Draw Layout Border (Perimeter)
        const borderX = stageCenterX - (stageCenterX + viewX - layoutMinX) * zoomLevel;
        const borderY = stageCenterY - (stageCenterY + viewY - layoutMinY) * zoomLevel;
        const borderW = layoutW * zoomLevel;
        const borderH = layoutH * zoomLevel;
        
        noFill();
        stroke('orange');
        strokeWeight(4);
        rect(borderX, borderY, borderW, borderH);

        // Sync Browser Sources to this perimeter
        if (config.syncedBrowserSources.length > 0) {
            const syncedMoving = syncBrowserSources({ x: borderX, y: borderY, w: borderW, h: borderH }, layoutW, layoutH);
            if (syncedMoving) sourcesAreMoving = true;
        }

        // Visualization Bounding Box
        stroke(255, 255, 0, 100);
        strokeWeight(10);
        noFill();
        const stageBBW = config.boundingBoxSize * zoomLevel;
        rect(stageCenterX - (viewX - (mousePos.x - stageCenterX)) * zoomLevel - stageBBW/2, 
             stageCenterY - (viewY - (mousePos.y - stageCenterY)) * zoomLevel - stageBBW/2, 
             stageBBW, stageBBW);
    }

    // MOUSE
    const stageMouseX = stageCenterX + (mousePos.x - (stageCenterX + viewX)) * zoomLevel;
    const stageMouseY = stageCenterY + (mousePos.y - (stageCenterY + viewY)) * zoomLevel;

    fill(255, 0, 0);
    noStroke();
    circle(stageMouseX, stageMouseY, 20);
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

window.addEventListener('keydown', (e) => {
    if (config.hotkeyToggleMenu && e.key.toLowerCase() === config.hotkeyToggleMenu.toLowerCase()) {
        toggleSettings();
    }
});