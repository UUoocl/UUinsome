const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outMonitors = op.outArray("Monitors");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetMonitorList')
            .then((data) => {
                if (data) {
                    outMonitors.set(data.monitors || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetMonitorList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
