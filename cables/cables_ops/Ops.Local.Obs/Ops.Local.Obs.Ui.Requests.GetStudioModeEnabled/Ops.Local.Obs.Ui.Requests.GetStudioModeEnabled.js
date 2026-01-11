const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outStudioModeEnabled = op.outBool("Studio Mode Enabled");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetStudioModeEnabled')
            .then((data) => {
                if (data) {
                    outStudioModeEnabled.set(data.studioModeEnabled || false);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetStudioModeEnabled):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
