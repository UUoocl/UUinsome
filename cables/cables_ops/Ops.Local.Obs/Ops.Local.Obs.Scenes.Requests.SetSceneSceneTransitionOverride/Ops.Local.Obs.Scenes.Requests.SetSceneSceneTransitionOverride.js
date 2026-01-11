const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    inTransitionName = op.inString("Transition Name", ""),
    inTransitionDuration = op.inInt("Transition Duration", 0),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {};
        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();
        const transitionName = inTransitionName.get();
        const transitionDuration = inTransitionDuration.get();

        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;
        if (transitionName !== "") params.transitionName = transitionName;
        if (transitionDuration > 0) params.transitionDuration = transitionDuration;

        if (!sceneName && !sceneUuid) {
            op.logError("Scene Name or Scene UUID is required");
            return;
        }

        obs.call('SetSceneSceneTransitionOverride', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetSceneSceneTransitionOverride):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
