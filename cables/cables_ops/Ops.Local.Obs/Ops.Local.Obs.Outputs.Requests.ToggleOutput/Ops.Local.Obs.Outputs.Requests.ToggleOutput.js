const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inOutputName = op.inString("Output Name", ""),
    outTrigger = op.outTrigger("Finished"),
    outOutputActive = op.outBool("Output Active");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const name = inOutputName.get();
        if (!name) {
            op.logError("Output Name is required");
            return;
        }

        obs.call('ToggleOutput', {
            outputName: name
        })
            .then((data) => {
                if (data) {
                    outOutputActive.set(data.outputActive || false);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (ToggleOutput):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
