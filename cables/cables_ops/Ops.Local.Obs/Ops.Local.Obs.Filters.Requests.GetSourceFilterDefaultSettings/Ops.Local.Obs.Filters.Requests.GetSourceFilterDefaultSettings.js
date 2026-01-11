const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inFilterKind = op.inString("Filter Kind", ""),
    outTrigger = op.outTrigger("Finished"),
    outDefaultFilterSettings = op.outObject("Default Filter Settings");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const filterKind = inFilterKind.get();
        if (!filterKind) {
            op.logError("Filter Kind is required");
            return;
        }

        obs.call('GetSourceFilterDefaultSettings', { filterKind: filterKind })
            .then((data) => {
                if (data) {
                    outDefaultFilterSettings.set(data.defaultFilterSettings || {});
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSourceFilterDefaultSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
