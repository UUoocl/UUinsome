const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    inInputDeinterlaceFieldOrder = op.inString("Deinterlace Field Order", "OBS_DEINTERLACE_FIELD_ORDER_TOP"),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {
            inputDeinterlaceFieldOrder: inInputDeinterlaceFieldOrder.get()
        };
        const inputName = inInputName.get();
        const inputUuid = inInputUuid.get();

        if (inputName) params.inputName = inputName;
        if (inputUuid) params.inputUuid = inputUuid;

        if (!inputName && !inputUuid) {
            op.logError("Input Name or Input UUID is required");
            return;
        }

        obs.call('SetInputDeinterlaceFieldOrder', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetInputDeinterlaceFieldOrder):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
