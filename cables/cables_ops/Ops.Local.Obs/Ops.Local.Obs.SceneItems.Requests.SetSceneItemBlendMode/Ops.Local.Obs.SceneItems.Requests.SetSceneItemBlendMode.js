const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    inSceneItemId = op.inInt("Scene Item ID", 0),
    inSceneItemBlendMode = op.inString("Scene Item Blend Mode", "OBS_BLEND_NORMAL"),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {
            sceneItemId: inSceneItemId.get(),
            sceneItemBlendMode: inSceneItemBlendMode.get()
        };

        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();
        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;

        obs.call('SetSceneItemBlendMode', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetSceneItemBlendMode):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
