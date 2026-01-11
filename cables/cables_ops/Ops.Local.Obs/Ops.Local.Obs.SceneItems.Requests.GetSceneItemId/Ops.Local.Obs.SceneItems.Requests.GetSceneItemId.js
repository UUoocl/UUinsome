const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    inSourceName = op.inString("Source Name", ""),
    inSearchOffset = op.inInt("Search Offset", 0),
    outTrigger = op.outTrigger("Finished"),
    outSceneItemId = op.outNumber("Scene Item ID");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const sourceName = inSourceName.get();
        if (!sourceName) {
            op.logError("Source Name is required");
            return;
        }

        const params = {
            sourceName: sourceName,
            searchOffset: inSearchOffset.get()
        };

        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();
        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;

        obs.call('GetSceneItemId', params)
            .then((data) => {
                if (data) {
                    outSceneItemId.set(data.sceneItemId || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSceneItemId):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
