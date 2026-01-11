const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inEventData = op.inObject("Event Data"),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const eventData = inEventData.get() || {};
        obs.call('BroadcastCustomEvent', {
            eventData: eventData
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (BroadcastCustomEvent):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
