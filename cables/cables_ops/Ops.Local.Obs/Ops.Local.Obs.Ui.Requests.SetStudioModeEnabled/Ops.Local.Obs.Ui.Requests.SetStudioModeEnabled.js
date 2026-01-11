const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inStudioModeEnabled = op.inBool("Studio Mode Enabled", true),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const studioModeEnabled = inStudioModeEnabled.get();
        obs.call('SetStudioModeEnabled', {
            studioModeEnabled: studioModeEnabled
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetStudioModeEnabled):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
