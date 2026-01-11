const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    inInputSettings = op.inObject("Input Settings"),
    inOverlay = op.inBool("Overlay", true),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const inputSettings = inInputSettings.get();
        if (!inputSettings) {
            op.logError("Input Settings object is required");
            return;
        }

        const params = {
            inputSettings: inputSettings,
            overlay: inOverlay.get()
        };

        const inputName = inInputName.get();
        const inputUuid = inInputUuid.get();
        if (inputName) params.inputName = inputName;
        if (inputUuid) params.inputUuid = inputUuid;

        if (!inputName && !inputUuid) {
            op.logError("Input Name or Input UUID is required");
            return;
        }

        obs.call('SetInputSettings', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetInputSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
