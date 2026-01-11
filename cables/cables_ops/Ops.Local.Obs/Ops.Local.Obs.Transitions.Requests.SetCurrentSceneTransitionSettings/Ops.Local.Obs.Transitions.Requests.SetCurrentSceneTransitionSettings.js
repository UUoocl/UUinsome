const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inTransitionSettings = op.inObject("Transition Settings"),
    inOverlay = op.inBool("Overlay", true),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const settings = inTransitionSettings.get() || {};

        obs.call('SetCurrentSceneTransitionSettings', {
            transitionSettings: settings,
            overlay: inOverlay.get()
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetCurrentSceneTransitionSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
