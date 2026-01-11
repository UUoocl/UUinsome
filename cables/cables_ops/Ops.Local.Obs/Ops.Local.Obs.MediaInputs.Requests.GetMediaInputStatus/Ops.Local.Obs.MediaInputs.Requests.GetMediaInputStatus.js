const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    outTrigger = op.outTrigger("Finished"),
    outMediaState = op.outString("Media State"),
    outMediaDuration = op.outNumber("Media Duration (ms)"),
    outMediaCursor = op.outNumber("Media Cursor (ms)");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {};
        const inputName = inInputName.get();
        const inputUuid = inInputUuid.get();

        if (inputName) params.inputName = inputName;
        if (inputUuid) params.inputUuid = inputUuid;

        if (!inputName && !inputUuid) {
            op.logError("Input Name or Input UUID is required");
            return;
        }

        obs.call('GetMediaInputStatus', params)
            .then((data) => {
                if (data) {
                    outMediaState.set(data.mediaState || "OBS_MEDIA_STATE_NONE");
                    outMediaDuration.set(data.mediaDuration || 0);
                    outMediaCursor.set(data.mediaCursor || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetMediaInputStatus):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
