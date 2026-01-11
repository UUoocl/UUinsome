const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    outTrigger = op.outTrigger("Finished"),
    outInputAudioTracks = op.outObject("Audio Tracks");

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

        obs.call('GetInputAudioTracks', params)
            .then((data) => {
                if (data) {
                    outInputAudioTracks.set(data.inputAudioTracks || {});
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetInputAudioTracks):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
