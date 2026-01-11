const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inOutputName = op.inString("Output Name", ""),
    inOutputSettings = op.inObject("Output Settings"),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const name = inOutputName.get();
        const settings = inOutputSettings.get();

        if (!name || !settings) {
            op.logError("Output Name and Output Settings are required");
            return;
        }

        obs.call('SetOutputSettings', {
            outputName: name,
            outputSettings: settings
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetOutputSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
