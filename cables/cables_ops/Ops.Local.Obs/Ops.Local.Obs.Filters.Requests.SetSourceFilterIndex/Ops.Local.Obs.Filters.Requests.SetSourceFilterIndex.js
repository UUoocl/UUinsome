const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSourceName = op.inString("Source Name", ""),
    inSourceUuid = op.inString("Source UUID", ""),
    inFilterName = op.inString("Filter Name", ""),
    inFilterIndex = op.inInt("Filter Index", 0),
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
            filterName: filterName,
            filterIndex: inFilterIndex.get()
        };

        const sourceName = inSourceName.get();
        const sourceUuid = inSourceUuid.get();
        if (sourceName) params.sourceName = sourceName;
        if (sourceUuid) params.sourceUuid = sourceUuid;

        if (!sourceName && !sourceUuid) {
            op.logError("Source Name or Source UUID is required");
            return;
        }

        obs.call('SetSourceFilterIndex', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetSourceFilterIndex):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
