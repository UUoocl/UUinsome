const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSourceName = op.inString("Source Name", ""),
    inSourceUuid = op.inString("Source UUID", ""),
    inFilterName = op.inString("Filter Name", ""),
    inFilterSettings = op.inObject("Filter Settings"),
    inOverlay = op.inBool("Overlay", true),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const filterName = inFilterName.get();
        const filterSettings = inFilterSettings.get();

        if (!filterName || !filterSettings) {
            op.logError("Filter Name and Filter Settings are required");
            return;
        }

        const params = {
            filterName: filterName,
            filterSettings: filterSettings,
            overlay: inOverlay.get()
        };

        const sourceName = inSourceName.get();
        const sourceUuid = inSourceUuid.get();
        if (sourceName) params.sourceName = sourceName;
        if (sourceUuid) params.sourceUuid = sourceUuid;

        if (!sourceName && !sourceUuid) {
            op.logError("Source Name or Source UUID is required");
            return;
        }

        obs.call('SetSourceFilterSettings', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetSourceFilterSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
