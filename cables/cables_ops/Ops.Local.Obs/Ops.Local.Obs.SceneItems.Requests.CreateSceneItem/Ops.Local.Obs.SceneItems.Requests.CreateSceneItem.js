const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    inSourceName = op.inString("Source Name", ""),
    inSourceUuid = op.inString("Source UUID", ""),
    inSceneItemEnabled = op.inBool("Scene Item Enabled", true),
    outTrigger = op.outTrigger("Finished"),
    outSceneItemId = op.outNumber("Scene Item ID");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {
            sceneItemEnabled: inSceneItemEnabled.get()
        };

        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();
        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;

        const sourceName = inSourceName.get();
        const sourceUuid = inSourceUuid.get();
        if (sourceName) params.sourceName = sourceName;
        if (sourceUuid) params.sourceUuid = sourceUuid;

        if (!params.sceneName && !params.sceneUuid) {
            op.logError("Scene Name or Scene UUID is required");
            return;
        }
        if (!params.sourceName && !params.sourceUuid) {
            op.logError("Source Name or Source UUID is required");
            return;
        }

        obs.call('CreateSceneItem', params)
            .then((data) => {
                if (data) {
                    outSceneItemId.set(data.sceneItemId || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (CreateSceneItem):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
