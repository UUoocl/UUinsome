const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Group Name", ""),
    inSceneUuid = op.inString("Group UUID", ""),
    outTrigger = op.outTrigger("Finished"),
    outSceneItems = op.outArray("Scene Items");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {};
        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();

        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;

        obs.call('GetGroupSceneItemList', params)
            .then((data) => {
                if (data) {
                    outSceneItems.set(data.sceneItems || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetGroupSceneItemList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
