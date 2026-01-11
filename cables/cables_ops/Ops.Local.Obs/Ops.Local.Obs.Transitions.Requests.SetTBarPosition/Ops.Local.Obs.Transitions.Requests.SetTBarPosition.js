const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inPosition = op.inFloat("Position", 0),
    inRelease = op.inBool("Release", true),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const position = inPosition.get();
        if (position < 0 || position > 1) {
            op.logError("Position must be between 0.0 and 1.0");
            return;
        }

        obs.call('SetTBarPosition', {
            position: position,
            release: inRelease.get()
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetTBarPosition):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
