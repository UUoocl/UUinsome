const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneCollectionName = op.inString("Scene Collection Name", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const name = inSceneCollectionName.get();
        if (!name) {
            op.logError("Scene Collection Name is required");
            return;
        }

        obs.call('SetCurrentSceneCollection', {
            sceneCollectionName: name
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetCurrentSceneCollection):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
