const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    inVolumeMul = op.inFloat("Volume Multiplier", -1),
    inVolumeDb = op.inFloat("Volume dB", -999),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {};
        const inputName = inInputName.get();
        const inputUuid = inInputUuid.get();
        const volumeMul = inVolumeMul.get();
        const volumeDb = inVolumeDb.get();

        if (inputName) params.inputName = inputName;
        if (inputUuid) params.inputUuid = inputUuid;

        if (volumeMul >= 0) params.inputVolumeMul = volumeMul;
        if (volumeDb > -999) params.inputVolumeDb = volumeDb;

        if (!inputName && !inputUuid) {
            op.logError("Input Name or Input UUID is required");
            return;
        }

        obs.call('SetInputVolume', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetInputVolume):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
