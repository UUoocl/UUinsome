const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inTransitionName = op.inString("Transition Name", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const name = inTransitionName.get();
        if (!name) {
            op.logError("Transition Name is required");
            return;
        }

        obs.call('SetCurrentSceneTransition', {
            transitionName: name
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetCurrentSceneTransition):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
