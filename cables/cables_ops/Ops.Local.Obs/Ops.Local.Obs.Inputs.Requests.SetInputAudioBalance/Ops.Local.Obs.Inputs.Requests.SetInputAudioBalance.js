const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    inInputAudioBalance = op.inFloat("Audio Balance", 0.5),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const balance = inInputAudioBalance.get();
        const params = {
            inputAudioBalance: balance
        };
        const inputName = inInputName.get();
        const inputUuid = inInputUuid.get();

        if (inputName) params.inputName = inputName;
        if (inputUuid) params.inputUuid = inputUuid;

        if (!inputName && !inputUuid) {
            op.logError("Input Name or Input UUID is required");
            return;
        }

        obs.call('SetInputAudioBalance', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetInputAudioBalance):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
