const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outCurrentSceneCollectionName = op.outString("Current Scene Collection Name"),
    outSceneCollections = op.outArray("Scene Collections");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetSceneCollectionList')
            .then((data) => {
                if (data) {
                    outCurrentSceneCollectionName.set(data.currentSceneCollectionName || "");
                    outSceneCollections.set(data.sceneCollections || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSceneCollectionList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
