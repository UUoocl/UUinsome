const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSourceName = op.inString("Source Name", ""),
    inSourceUuid = op.inString("Source UUID", ""),
    inFilterName = op.inString("Filter Name", ""),
    inFilterKind = op.inString("Filter Kind", ""),
    inFilterSettings = op.inObject("Filter Settings"),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const filterName = inFilterName.get();
        const filterKind = inFilterKind.get();

        if (!filterName || !filterKind) {
            op.logError("Filter Name and Filter Kind are required");
            return;
        }

        const params = {
            filterName: filterName,
            filterKind: filterKind
        };

        const sourceName = inSourceName.get();
        const sourceUuid = inSourceUuid.get();
        if (sourceName) params.sourceName = sourceName;
        if (sourceUuid) params.sourceUuid = sourceUuid;

        const filterSettings = inFilterSettings.get();
        if (filterSettings) params.filterSettings = filterSettings;

        if (!sourceName && !sourceUuid) {
            op.logError("Source Name or Source UUID is required");
            return;
        }

        obs.call('CreateSourceFilter', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (CreateSourceFilter):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
