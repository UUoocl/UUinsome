const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    inNewSceneName = op.inString("New Scene Name", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {
            newSceneName: inNewSceneName.get()
        };
        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();

        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;

        if ((!sceneName && !sceneUuid) || !params.newSceneName) {
            op.logError("Scene Name/UUID and New Scene Name are required");
            return;
        }

        obs.call('SetSceneName', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetSceneName):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
