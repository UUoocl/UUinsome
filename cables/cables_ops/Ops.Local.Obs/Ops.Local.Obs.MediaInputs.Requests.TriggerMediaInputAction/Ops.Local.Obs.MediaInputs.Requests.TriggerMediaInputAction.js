const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    inMediaAction = op.inString("Media Action", "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY"),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const action = inMediaAction.get();
        if (!action) {
            op.logError("Media Action is required");
            return;
        }

        const params = {
            mediaAction: action
        };

        const inputName = inInputName.get();
        const inputUuid = inInputUuid.get();
        if (inputName) params.inputName = inputName;
        if (inputUuid) params.inputUuid = inputUuid;

        if (!inputName && !inputUuid) {
            op.logError("Input Name or Input UUID is required");
            return;
        }

        obs.call('TriggerMediaInputAction', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (TriggerMediaInputAction):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
