const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outRecordDirectory = op.outString("Record Directory");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetRecordDirectory')
            .then((data) => {
                if (data) {
                    outRecordDirectory.set(data.recordDirectory || "");
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetRecordDirectory):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
