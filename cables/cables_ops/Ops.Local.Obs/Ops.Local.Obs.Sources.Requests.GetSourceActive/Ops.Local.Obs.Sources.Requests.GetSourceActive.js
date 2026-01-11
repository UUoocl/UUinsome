const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSourceName = op.inString("Source Name", ""),
    inSourceUuid = op.inString("Source UUID", ""),
    outTrigger = op.outTrigger("Finished"),
    outVideoActive = op.outBool("Video Active"),
    outVideoShowing = op.outBool("Video Showing");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {};
        const sourceName = inSourceName.get();
        const sourceUuid = inSourceUuid.get();

        if (sourceName) params.sourceName = sourceName;
        if (sourceUuid) params.sourceUuid = sourceUuid;

        if (!sourceName && !sourceUuid) {
            op.logError("Source Name or Source UUID is required");
            return;
        }

        obs.call('GetSourceActive', params)
            .then((data) => {
                if (data) {
                    outVideoActive.set(data.videoActive || false);
                    outVideoShowing.set(data.videoShowing || false);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSourceActive):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
