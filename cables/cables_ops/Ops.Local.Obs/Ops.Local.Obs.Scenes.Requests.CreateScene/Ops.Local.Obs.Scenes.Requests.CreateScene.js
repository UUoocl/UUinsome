const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    outTrigger = op.outTrigger("Finished"),
    outSceneUuid = op.outString("Scene UUID");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const sceneName = inSceneName.get();
        if (!sceneName) {
            op.logError("Scene Name is required");
            return;
        }

        obs.call('CreateScene', { sceneName: sceneName })
            .then((data) => {
                if (data) {
                    outSceneUuid.set(data.sceneUuid || "");
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (CreateScene):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
