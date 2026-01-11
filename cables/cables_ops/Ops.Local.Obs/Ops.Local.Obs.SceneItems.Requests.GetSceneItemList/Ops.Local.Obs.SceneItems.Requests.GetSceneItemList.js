const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    outTrigger = op.outTrigger("Finished"),
    outSceneItems = op.outArray("Scene Items");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {};
        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();

        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;

        obs.call('GetSceneItemList', params)
            .then((data) => {
                if (data) {
                    outSceneItems.set(data.sceneItems || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSceneItemList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
