const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    inSceneItemId = op.inInt("Scene Item ID", 0),
    inDestinationSceneName = op.inString("Destination Scene Name", ""),
    inDestinationSceneUuid = op.inString("Destination Scene UUID", ""),
    outTrigger = op.outTrigger("Finished"),
    outSceneItemId = op.outNumber("New Scene Item ID");

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

        const destSceneName = inDestinationSceneName.get();
        const destSceneUuid = inDestinationSceneUuid.get();
        if (destSceneName) params.destinationSceneName = destSceneName;
        if (destSceneUuid) params.destinationSceneUuid = destSceneUuid;

        obs.call('DuplicateSceneItem', params)
            .then((data) => {
                if (data) {
                    outSceneItemId.set(data.sceneItemId || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (DuplicateSceneItem):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
