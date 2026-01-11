let mappings = {}; 
let settingsVisible = false;

let config = {
    hotkeyZoomIn: '=',
    hotkeyZoomOut: '-',
    hotkeyToggleMenu: 's',
    boundingBoxSize: 200,
    movementType: 'smooth',
    movementSpeed: 0.1,
    zoomIncrement: 0.1,
    syncedBrowserSources: []
};

window.toggleSettings = function() {
    settingsVisible = !settingsVisible;
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.style.display = settingsVisible ? 'block' : 'none';
    if (settingsVisible) {
        renderBrowserSyncUI();
    }
};

window.clearHotkey = function(configKey) {
    config[configKey] = '';
    const idMap = {
        'hotkeyZoomIn': 'hotkey-zoom-in',
        'hotkeyZoomOut': 'hotkey-zoom-out',
        'hotkeyToggleMenu': 'hotkey-toggle-menu'
    };
    const el = document.getElementById(idMap[configKey]);
    if (el) el.value = '';
};

async function renderBrowserSyncUI() {
    const container = document.getElementById('browser-sync-list');
    if (!container) return;
    
    container.innerHTML = 'Loading browser sources...';
    const browserSources = await obsManager.getBrowserSources();
    
    if (browserSources.length === 0) {
        container.innerHTML = '<p style="font-size: 0.8em; color: #888;">No browser sources found in OBS.</p>';
        return;
    }

    container.innerHTML = browserSources.map(name => `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
            <input type="checkbox" id="sync-${name}" value="${name}" 
                ${config.syncedBrowserSources.includes(name) ? 'checked' : ''}>
            <label for="sync-${name}" style="font-size: 0.85em; cursor: pointer;">${name}</label>
        </div>
    `).join('');
}

window.updateSyncedSources = function() {
    const checkboxes = document.querySelectorAll('#browser-sync-list input[type="checkbox"]');
    config.syncedBrowserSources = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
};

window.saveSettings = async function() {
    config.boundingBoxSize = parseInt(document.getElementById('bounding-box-size').value);
    config.movementType = document.getElementById('movement-type').value;
    config.movementSpeed = parseFloat(document.getElementById('movement-speed').value);
    config.zoomIncrement = parseFloat(document.getElementById('zoom-increment').value);
    
    // Explicitly update the synced sources list from checkboxes before saving
    window.updateSyncedSources();

    // Perform one-time resolution update for all synced sources based on current layout
    const { layoutW, layoutH } = window.getLayoutDimensions();
    if (layoutW > 0 && layoutH > 0) {
        const targetHeight = Math.round(640 * (layoutH / layoutW));
        for (const sourceName of config.syncedBrowserSources) {
            await obsManager.setInputSettings(sourceName, { 
                width: 640, 
                height: targetHeight 
            });
            // Clear cached dimensions in sketch.js so they are refetched with new resolution
            if (typeof browserSourceDimensions !== 'undefined') {
                delete browserSourceDimensions[sourceName];
            }
        }
    }
    
    localStorage.setItem('zoomFollowSettings', JSON.stringify({
        mappings,
        config
    }));
   
    if (window.recalculateDesktopBounds) {
        window.recalculateDesktopBounds();
    }
    
    window.toggleSettings();
};

function loadSavedSettings() {
    const saved = localStorage.getItem('zoomFollowSettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            mappings = parsed.mappings || {};
            
            // Migrate old string-based mappings if necessary
            Object.keys(mappings).forEach(key => {
                if (typeof mappings[key] === 'string') {
                    mappings[key] = { sourceName: mappings[key], resolutionFactor: 1.0 };
                }
            });
            
            config = { ...config, ...(parsed.config || {}) };
            
            // Update UI
            if (document.getElementById('bounding-box-size')) {
                document.getElementById('bounding-box-size').value = config.boundingBoxSize || 200;
                document.getElementById('movement-type').value = config.movementType || 'smooth';
                document.getElementById('movement-speed').value = config.movementSpeed || 0.1;
                document.getElementById('zoom-increment').value = config.zoomIncrement || 0.1;
                document.getElementById('hotkey-zoom-in').value = config.hotkeyZoomIn || '';
                document.getElementById('hotkey-zoom-out').value = config.hotkeyZoomOut || '';
                document.getElementById('hotkey-toggle-menu').value = config.hotkeyToggleMenu || '';
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    }
}

window.updateMapping = function(index, key, value) {
    if (typeof monitorInstances !== 'undefined') {
        const mon = monitorInstances.find(m => m.index == index);
        if (mon) {
            if (key === 'resolutionFactor') {
                mon.resolutionFactor = parseFloat(value) || 1.0;
            } else {
                mon.sourceName = value;
            }
        }
    }

    if (!mappings[index]) mappings[index] = { sourceName: '', resolutionFactor: 1.0 };
    
    if (key === 'resolutionFactor') {
        mappings[index][key] = parseFloat(value) || 1.0;
    } else {
        mappings[index][key] = value;
    }
};

function handleKeyboard(data) {
    if (config.hotkeyZoomIn && data.key === config.hotkeyZoomIn) {
        if (typeof targetZoomLevel !== 'undefined') targetZoomLevel += config.zoomIncrement;
    } else if (config.hotkeyZoomOut && data.key === config.hotkeyZoomOut) {
        if (typeof targetZoomLevel !== 'undefined') targetZoomLevel = Math.max(0.1, targetZoomLevel - config.zoomIncrement);
    } else if (config.hotkeyToggleMenu && data.key === config.hotkeyToggleMenu) {
        window.toggleSettings();
    }
}

// Hotkey setup UI
document.addEventListener('DOMContentLoaded', () => {
    ['hotkey-zoom-in', 'hotkey-zoom-out', 'hotkey-toggle-menu'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', function() {
                const configKey = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace('Hotkey', 'hotkey');
                this.value = 'Press a key...';
                const listener = (event) => {
                    this.value = event.data.key;
                    config[configKey] = event.data.key;
                    keyboardChannel.removeEventListener('message', listener);
                };
                keyboardChannel.addEventListener('message', listener);
            });
        }
    });
});
