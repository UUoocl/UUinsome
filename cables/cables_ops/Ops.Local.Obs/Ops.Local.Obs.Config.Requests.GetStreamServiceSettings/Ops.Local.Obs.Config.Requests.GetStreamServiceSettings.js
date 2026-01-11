const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outStreamServiceType = op.outString("Stream Service Type"),
    outStreamServiceSettings = op.outObject("Stream Service Settings");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetStreamServiceSettings')
            .then((data) => {
                if (data) {
                    outStreamServiceType.set(data.streamServiceType || "");
                    outStreamServiceSettings.set(data.streamServiceSettings || {});
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetStreamServiceSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
