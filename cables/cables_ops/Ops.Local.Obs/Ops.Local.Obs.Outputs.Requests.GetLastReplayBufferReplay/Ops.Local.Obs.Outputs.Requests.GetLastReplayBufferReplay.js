const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outSavedReplayPath = op.outString("Saved Replay Path");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetLastReplayBufferReplay')
            .then((data) => {
                if (data) {
                    outSavedReplayPath.set(data.savedReplayPath || "");
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetLastReplayBufferReplay):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
