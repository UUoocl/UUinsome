const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outSourceFilterKinds = op.outArray("Source Filter Kinds");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetSourceFilterKindList')
            .then((data) => {
                if (data) {
                    outSourceFilterKinds.set(data.sourceFilterKinds || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSourceFilterKindList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
