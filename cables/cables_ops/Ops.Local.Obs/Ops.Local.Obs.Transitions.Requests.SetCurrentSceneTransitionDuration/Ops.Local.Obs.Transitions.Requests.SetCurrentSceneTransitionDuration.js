const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inTransitionDuration = op.inInt("Transition Duration", 300),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const duration = inTransitionDuration.get();
        if (duration < 50 || duration > 20000) {
            op.logError("Transition Duration must be between 50 and 20000 ms");
            return;
        }

        obs.call('SetCurrentSceneTransitionDuration', {
            transitionDuration: duration
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetCurrentSceneTransitionDuration):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
