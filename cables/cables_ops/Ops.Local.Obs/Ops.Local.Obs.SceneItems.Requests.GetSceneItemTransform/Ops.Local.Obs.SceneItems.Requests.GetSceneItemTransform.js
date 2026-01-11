const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    inSceneItemId = op.inInt("Scene Item ID", 0),
    outTrigger = op.outTrigger("Finished"),
    outSceneItemTransform = op.outObject("Scene Item Transform");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {
            sceneItemId: inSceneItemId.get()
        };

        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();
        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;

        obs.call('GetSceneItemTransform', params)
            .then((data) => {
                if (data) {
                    outSceneItemTransform.set(data.sceneItemTransform || {});
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSceneItemTransform):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
