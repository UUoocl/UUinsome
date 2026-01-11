const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    outTrigger = op.outTrigger("Finished"),
    outVolumeMul = op.outNumber("Volume Multiplier"),
    outVolumeDb = op.outNumber("Volume dB");

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

        obs.call('GetInputVolume', params)
            .then((data) => {
                if (data) {
                    outVolumeMul.set(data.inputVolumeMul || 0);
                    outVolumeDb.set(data.inputVolumeDb || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetInputVolume):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
