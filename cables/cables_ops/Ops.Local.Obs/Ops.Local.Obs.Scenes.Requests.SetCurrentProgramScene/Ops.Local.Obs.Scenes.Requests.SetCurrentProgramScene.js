const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {};
        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();

        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;

        if (!sceneName && !sceneUuid) {
            op.logError("Scene Name or Scene UUID is required");
            return;
        }

        obs.call('SetCurrentProgramScene', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetCurrentProgramScene):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
