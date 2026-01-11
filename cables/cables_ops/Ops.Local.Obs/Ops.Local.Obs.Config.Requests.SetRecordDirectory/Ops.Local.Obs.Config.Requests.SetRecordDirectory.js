const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inRecordDirectory = op.inString("Record Directory", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const dir = inRecordDirectory.get();
        if (!dir) {
            op.logError("Record Directory is required");
            return;
        }

        obs.call('SetRecordDirectory', {
            recordDirectory: dir
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetRecordDirectory):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
