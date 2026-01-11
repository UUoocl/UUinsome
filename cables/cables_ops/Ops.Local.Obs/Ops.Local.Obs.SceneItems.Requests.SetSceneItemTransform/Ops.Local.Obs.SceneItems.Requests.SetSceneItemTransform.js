const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    inSceneItemId = op.inInt("Scene Item ID", 0),
    inSceneItemTransform = op.inObject("Scene Item Transform"),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const transform = inSceneItemTransform.get();
        if (!transform) {
            op.logError("Scene Item Transform object is required");
            return;
        }

        const params = {
            sceneItemId: inSceneItemId.get(),
            sceneItemTransform: transform
        };

        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();
        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;

        obs.call('SetSceneItemTransform', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetSceneItemTransform):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
