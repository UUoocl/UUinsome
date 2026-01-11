const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outCurrentProgramSceneName = op.outString("Current Program Scene Name"),
    outCurrentProgramSceneUuid = op.outString("Current Program Scene UUID"),
    outCurrentPreviewSceneName = op.outString("Current Preview Scene Name"),
    outCurrentPreviewSceneUuid = op.outString("Current Preview Scene UUID"),
    outScenes = op.outArray("Scenes");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetSceneList')
            .then((data) => {
                if (data) {
                    outCurrentProgramSceneName.set(data.currentProgramSceneName || "");
                    outCurrentProgramSceneUuid.set(data.currentProgramSceneUuid || "");
                    outCurrentPreviewSceneName.set(data.currentPreviewSceneName || "");
                    outCurrentPreviewSceneUuid.set(data.currentPreviewSceneUuid || "");
                    outScenes.set(data.scenes || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSceneList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
