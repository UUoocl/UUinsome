const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSourceName = op.inString("Source Name", ""),
    inSourceUuid = op.inString("Source UUID", ""),
    inMonitorIndex = op.inInt("Monitor Index", -1),
    inProjectorGeometry = op.inString("Projector Geometry", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {
            monitorIndex: inMonitorIndex.get()
        };

        const sourceName = inSourceName.get();
        const sourceUuid = inSourceUuid.get();
        if (sourceName) params.sourceName = sourceName;
        if (sourceUuid) params.sourceUuid = sourceUuid;

        const projectorGeometry = inProjectorGeometry.get();
        if (projectorGeometry) params.projectorGeometry = projectorGeometry;

        if (!sourceName && !sourceUuid) {
            op.logError("Source Name or Source UUID is required");
            return;
        }

        obs.call('OpenSourceProjector', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (OpenSourceProjector):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
