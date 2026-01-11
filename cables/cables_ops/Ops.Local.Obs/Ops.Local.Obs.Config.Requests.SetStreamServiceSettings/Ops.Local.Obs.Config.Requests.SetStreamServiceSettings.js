const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inStreamServiceType = op.inString("Stream Service Type", ""),
    inStreamServiceSettings = op.inObject("Stream Service Settings"),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const type = inStreamServiceType.get();
        const settings = inStreamServiceSettings.get();

        if (!type || !settings) {
            op.logError("Stream Service Type and Stream Service Settings are required");
            return;
        }

        obs.call('SetStreamServiceSettings', {
            streamServiceType: type,
            streamServiceSettings: settings
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetStreamServiceSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
