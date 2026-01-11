const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inVideoMixType = op.inString("Video Mix Type", "OBS_WEBSOCKET_VIDEO_MIX_TYPE_PROGRAM"),
    inMonitorIndex = op.inInt("Monitor Index", -1),
    inProjectorGeometry = op.inString("Projector Geometry", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const videoMixType = inVideoMixType.get();
        if (!videoMixType) {
            op.logError("Video Mix Type is required");
            return;
        }

        const params = {
            videoMixType: videoMixType,
            monitorIndex: inMonitorIndex.get()
        };

        const projectorGeometry = inProjectorGeometry.get();
        if (projectorGeometry) params.projectorGeometry = projectorGeometry;

        obs.call('OpenVideoMixProjector', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (OpenVideoMixProjector):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
