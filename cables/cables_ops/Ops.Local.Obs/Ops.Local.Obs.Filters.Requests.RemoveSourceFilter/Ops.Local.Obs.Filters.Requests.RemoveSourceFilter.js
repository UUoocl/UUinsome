const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSourceName = op.inString("Source Name", ""),
    inSourceUuid = op.inString("Source UUID", ""),
    inFilterName = op.inString("Filter Name", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const filterName = inFilterName.get();
        if (!filterName) {
            op.logError("Filter Name is required");
            return;
        }

        const params = {
            filterName: filterName
        };

        const sourceName = inSourceName.get();
        const sourceUuid = inSourceUuid.get();
        if (sourceName) params.sourceName = sourceName;
        if (sourceUuid) params.sourceUuid = sourceUuid;

        if (!sourceName && !sourceUuid) {
            op.logError("Source Name or Source UUID is required");
            return;
        }

        obs.call('RemoveSourceFilter', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (RemoveSourceFilter):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
