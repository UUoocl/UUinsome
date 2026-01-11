const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outTransitionName = op.outString("Transition Name"),
    outTransitionUuid = op.outString("Transition UUID"),
    outTransitionKind = op.outString("Transition Kind"),
    outTransitionFixed = op.outBool("Transition Fixed"),
    outTransitionDuration = op.outNumber("Transition Duration"),
    outTransitionConfigurable = op.outBool("Transition Configurable"),
    outTransitionSettings = op.outObject("Transition Settings");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetCurrentSceneTransition')
            .then((data) => {
                if (data) {
                    outTransitionName.set(data.transitionName || "");
                    outTransitionUuid.set(data.transitionUuid || "");
                    outTransitionKind.set(data.transitionKind || "");
                    outTransitionFixed.set(data.transitionFixed || false);
                    outTransitionDuration.set(data.transitionDuration || 0);
                    outTransitionConfigurable.set(data.transitionConfigurable || false);
                    outTransitionSettings.set(data.transitionSettings || {});
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetCurrentSceneTransition):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
