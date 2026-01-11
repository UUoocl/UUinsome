const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputKind = op.inString("Input Kind", ""),
    outTrigger = op.outTrigger("Finished"),
    outDefaultInputSettings = op.outObject("Default Input Settings");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const inputKind = inInputKind.get();
        if (!inputKind) {
            op.logError("Input Kind is required");
            return;
        }

        obs.call('GetInputDefaultSettings', { inputKind: inputKind })
            .then((data) => {
                if (data) {
                    outDefaultInputSettings.set(data.defaultInputSettings || {});
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetInputDefaultSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
