const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outTransitionCursor = op.outNumber("Transition Cursor");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetCurrentSceneTransitionCursor')
            .then((data) => {
                if (data) {
                    outTransitionCursor.set(data.transitionCursor || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetCurrentSceneTransitionCursor):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
