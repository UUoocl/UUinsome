const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outOutputActive = op.outBool("Output Active");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetVirtualCamStatus')
            .then((data) => {
                if (data) {
                    outOutputActive.set(data.outputActive || false);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetVirtualCamStatus):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
