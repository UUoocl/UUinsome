const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outOutputPath = op.outString("Output Path");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('StopRecord')
            .then((data) => {
                if (data) {
                    outOutputPath.set(data.outputPath || "");
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (StopRecord):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
