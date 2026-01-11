const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outCurrentTransitionName = op.outString("Current Transition Name"),
    outCurrentTransitionUuid = op.outString("Current Transition UUID"),
    outCurrentTransitionKind = op.outString("Current Transition Kind"),
    outTransitions = op.outArray("Transitions");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetSceneTransitionList')
            .then((data) => {
                if (data) {
                    outCurrentTransitionName.set(data.currentSceneTransitionName || "");
                    outCurrentTransitionUuid.set(data.currentSceneTransitionUuid || "");
                    outCurrentTransitionKind.set(data.currentSceneTransitionKind || "");
                    outTransitions.set(data.transitions || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSceneTransitionList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
