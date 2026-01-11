const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inOutputName = op.inString("Output Name", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const name = inOutputName.get();
        if (!name) {
            op.logError("Output Name is required");
            return;
        }

        obs.call('StopOutput', {
            outputName: name
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (StopOutput):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
