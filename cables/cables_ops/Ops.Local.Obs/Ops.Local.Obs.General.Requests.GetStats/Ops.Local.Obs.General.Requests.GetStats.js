const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outCpuUsage = op.outNumber("CPU Usage (%)"),
    outMemoryUsage = op.outNumber("Memory Usage (MB)"),
    outAvailableDiskSpace = op.outNumber("Available Disk Space"),
    outActiveFps = op.outNumber("Active FPS"),
    outAverageFrameRenderTime = op.outNumber("Avg Frame Render Time (ms)"),
    outRenderSkippedFrames = op.outNumber("Render Skipped Frames"),
    outRenderTotalFrames = op.outNumber("Render Total Frames"),
    outOutputSkippedFrames = op.outNumber("Output Skipped Frames"),
    outOutputTotalFrames = op.outNumber("Output Total Frames"),
    outWebSocketSessionIncomingMessages = op.outNumber("WS Incoming Messages"),
    outWebSocketSessionOutgoingMessages = op.outNumber("WS Outgoing Messages");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetStats')
            .then((data) => {
                if (data) {
                    outCpuUsage.set(data.cpuUsage || 0);
                    outMemoryUsage.set(data.memoryUsage || 0);
                    outAvailableDiskSpace.set(data.availableDiskSpace || 0);
                    outActiveFps.set(data.activeFps || 0);
                    outAverageFrameRenderTime.set(data.averageFrameRenderTime || 0);
                    outRenderSkippedFrames.set(data.renderSkippedFrames || 0);
                    outRenderTotalFrames.set(data.renderTotalFrames || 0);
                    outOutputSkippedFrames.set(data.outputSkippedFrames || 0);
                    outOutputTotalFrames.set(data.outputTotalFrames || 0);
                    outWebSocketSessionIncomingMessages.set(data.webSocketSessionIncomingMessages || 0);
                    outWebSocketSessionOutgoingMessages.set(data.webSocketSessionOutgoingMessages || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetStats):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
