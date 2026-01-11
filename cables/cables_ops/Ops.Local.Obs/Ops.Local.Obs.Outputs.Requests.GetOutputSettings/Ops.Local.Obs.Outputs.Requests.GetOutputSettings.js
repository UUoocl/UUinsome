const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inOutputName = op.inString("Output Name", ""),
    outTrigger = op.outTrigger("Finished"),
    outOutputSettings = op.outObject("Output Settings");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const name = inOutputName.get();
        if (!name) {
            op.logError("Output Name is required");
            return;
        }

        obs.call('GetOutputSettings', {
            outputName: name
        })
            .then((data) => {
                if (data) {
                    outOutputSettings.set(data.outputSettings || {});
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetOutputSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
