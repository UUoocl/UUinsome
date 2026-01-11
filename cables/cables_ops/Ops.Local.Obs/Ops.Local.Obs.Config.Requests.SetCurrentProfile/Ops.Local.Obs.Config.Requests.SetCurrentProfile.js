const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inProfileName = op.inString("Profile Name", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const name = inProfileName.get();
        if (!name) {
            op.logError("Profile Name is required");
            return;
        }

        obs.call('SetCurrentProfile', {
            profileName: name
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetCurrentProfile):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
