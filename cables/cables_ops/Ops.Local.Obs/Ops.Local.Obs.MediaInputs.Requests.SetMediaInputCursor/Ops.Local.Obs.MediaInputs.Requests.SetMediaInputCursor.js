const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    inMediaCursor = op.inNumber("Media Cursor (ms)", 0),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const cursor = inMediaCursor.get();
        if (cursor < 0) {
            op.logError("Media Cursor must be >= 0");
            return;
        }

        const params = {
            mediaCursor: cursor
        };

        const inputName = inInputName.get();
        const inputUuid = inInputUuid.get();
        if (inputName) params.inputName = inputName;
        if (inputUuid) params.inputUuid = inputUuid;

        if (!inputName && !inputUuid) {
            op.logError("Input Name or Input UUID is required");
            return;
        }

        obs.call('SetMediaInputCursor', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetMediaInputCursor):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
