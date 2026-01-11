const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outTransitionKinds = op.outArray("Transition Kinds");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetTransitionKindList')
            .then((data) => {
                if (data) {
                    outTransitionKinds.set(data.transitionKinds || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetTransitionKindList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
