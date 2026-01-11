const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inOutputName = op.inString("Output Name", ""),
    outTrigger = op.outTrigger("Finished"),
    outOutputActive = op.outBool("Output Active"),
    outOutputReconnecting = op.outBool("Output Reconnecting"),
    outOutputTimecode = op.outString("Output Timecode"),
    outOutputDuration = op.outNumber("Output Duration (ms)"),
    outOutputCongestion = op.outNumber("Output Congestion"),
    outOutputBytes = op.outNumber("Output Bytes"),
    outOutputSkippedFrames = op.outNumber("Output Skipped Frames"),
    outOutputTotalFrames = op.outNumber("Output Total Frames");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const name = inOutputName.get();
        if (!name) {
            op.logError("Output Name is required");
            return;
        }

        obs.call('GetOutputStatus', {
            outputName: name
        })
            .then((data) => {
                if (data) {
                    outOutputActive.set(data.outputActive || false);
                    outOutputReconnecting.set(data.outputReconnecting || false);
                    outOutputTimecode.set(data.outputTimecode || "00:00:00:00");
                    outOutputDuration.set(data.outputDuration || 0);
                    outOutputCongestion.set(data.outputCongestion || 0);
                    outOutputBytes.set(data.outputBytes || 0);
                    outOutputSkippedFrames.set(data.outputSkippedFrames || 0);
                    outOutputTotalFrames.set(data.outputTotalFrames || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetOutputStatus):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
