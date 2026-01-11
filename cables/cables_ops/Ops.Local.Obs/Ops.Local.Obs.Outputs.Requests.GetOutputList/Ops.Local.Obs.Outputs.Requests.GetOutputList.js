const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outOutputs = op.outArray("Outputs");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetOutputList')
            .then((data) => {
                if (data) {
                    outOutputs.set(data.outputs || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetOutputList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
