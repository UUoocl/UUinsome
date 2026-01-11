class OBSManager {
    constructor() {
        this.obs = new OBSWebSocket();
        this.isConnected = false;
        this.currentScene = "";
        this.lastUpdateTimes = {};
        
        // Callbacks
        this.onConnectionChange = null;
        this.onSceneChange = null;
    }

    async connect() {
        try {
            const response = await fetch('/api/obswss');
            const creds = await response.json();
            
            await this.obs.connect(`ws://${creds.IP}:${creds.PORT}`, creds.PW, {
                eventSubscriptions: 0
            });
            this.isConnected = true;
            if (this.onConnectionChange) this.onConnectionChange(true);
            
            const sceneData = await this.obs.call('GetCurrentProgramScene');
            this.currentScene = sceneData.currentProgramSceneName;

            this.obs.on('CurrentProgramSceneChanged', data => {
                this.currentScene = data.sceneName;
                if (this.onSceneChange) this.onSceneChange(data.sceneName);
            });

            return true;
        } catch (err) {
            console.error('OBS Connection failed:', err);
            if (this.onConnectionChange) this.onConnectionChange(false);
            return false;
        }
    }

    async getMonitorList() {
        if (!this.isConnected) return [];
        try {
            const data = await this.obs.call('GetMonitorList');
            return data.monitors || [];
        } catch (e) { console.error(e); return []; }
    }

    async getInputList() {
        if (!this.isConnected) return [];
        try {
            const inputs = await this.obs.call('GetInputList');
            return inputs.inputs.map(i => i.inputName);
        } catch (e) { console.error(e); return []; }
    }

    async getVideoSettings() {
        if (!this.isConnected) return { baseWidth: 1920, baseHeight: 1080 };
        try {
            const settings = await this.obs.call('GetVideoSettings');
            return {
                width: settings.baseWidth,
                height: settings.baseHeight
            };
        } catch (e) { console.error(e); return { width: 1920, height: 1080 }; }
    }

    async setInputSettings(sourceName, settings) {
        if (!this.isConnected) return;
        try {
            await this.obs.call('SetInputSettings', {
                inputName: sourceName,
                inputSettings: settings
            });
        } catch (e) { console.error('Failed to set input settings:', e); }
    }

    async getBrowserSources() {
        if (!this.isConnected) return [];
        try {
            const inputs = await this.obs.call('GetInputList', { inputKind: 'browser_source' });
            // Filter manually if the server doesn't support inputKind filter in GetInputList
            return inputs.inputs
                .filter(i => i.inputKind === 'browser_source' || i.unversionedInputKind === 'browser_source')
                .map(i => i.inputName);
        } catch (e) { console.error(e); return []; }
    }

    async getSceneItemDimensions(sourceName) {
        if (!this.isConnected || !this.currentScene) return null;
        try {
            const { sceneItemId } = await this.obs.call('GetSceneItemId', {
                sceneName: this.currentScene,
                sourceName: sourceName
            });
            const { sceneItemTransform } = await this.obs.call('GetSceneItemTransform', {
                sceneName: this.currentScene,
                sceneItemId: sceneItemId
            });
            return {
                width: sceneItemTransform.sourceWidth,
                height: sceneItemTransform.sourceHeight
            };
        } catch (e) { return null; }
    }

    async updateSceneItemTransform(sourceName, x, y, scaleX, scaleY) {
        if (!this.isConnected || !this.currentScene) return;
        
        const now = Date.now();
        if (now - (this.lastUpdateTimes[sourceName] || 0) < 16) return; 
        this.lastUpdateTimes[sourceName] = now;

        try {
            const { sceneItemId } = await this.obs.call('GetSceneItemId', {
                sceneName: this.currentScene,
                sourceName: sourceName
            });
            await this.obs.call('SetSceneItemTransform', {
                sceneName: this.currentScene,
                sceneItemId: sceneItemId,
                sceneItemTransform: {
                    scaleX: scaleX,
                    scaleY: scaleY,
                    positionX: x,
                    positionY: y
                }
            });
        } catch (e) { }
    }
}
