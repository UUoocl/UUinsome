const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outSceneName = op.outString("Scene Name"),
    outSceneUuid = op.outString("Scene UUID");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetCurrentProgramScene')
            .then((data) => {
                if (data) {
                    outSceneName.set(data.sceneName || "");
                    outSceneUuid.set(data.sceneUuid || "");
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetCurrentProgramScene):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
