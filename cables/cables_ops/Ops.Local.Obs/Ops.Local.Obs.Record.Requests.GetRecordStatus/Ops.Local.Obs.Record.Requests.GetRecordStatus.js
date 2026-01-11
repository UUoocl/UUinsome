const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outOutputActive = op.outBool("Output Active"),
    outOutputPaused = op.outBool("Output Paused"),
    outOutputTimecode = op.outString("Output Timecode"),
    outOutputDuration = op.outNumber("Output Duration (ms)"),
    outOutputBytes = op.outNumber("Output Bytes");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetRecordStatus')
            .then((data) => {
                if (data) {
                    outOutputActive.set(data.outputActive || false);
                    outOutputPaused.set(data.outputPaused || false);
                    outOutputTimecode.set(data.outputTimecode || "00:00:00:00");
                    outOutputDuration.set(data.outputDuration || 0);
                    outOutputBytes.set(data.outputBytes || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetRecordStatus):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
