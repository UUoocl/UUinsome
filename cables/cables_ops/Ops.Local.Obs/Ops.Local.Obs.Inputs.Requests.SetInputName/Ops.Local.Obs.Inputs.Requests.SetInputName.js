const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    inNewInputName = op.inString("New Input Name", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {
            newInputName: inNewInputName.get()
        };
        const inputName = inInputName.get();
        const inputUuid = inInputUuid.get();

        if (inputName) params.inputName = inputName;
        if (inputUuid) params.inputUuid = inputUuid;

        if ((!inputName && !inputUuid) || !params.newInputName) {
            op.logError("Input Name/UUID and New Input Name are required");
            return;
        }

        obs.call('SetInputName', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetInputName):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
