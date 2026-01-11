const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputKind = op.inString("Input Kind", ""),
    outTrigger = op.outTrigger("Finished"),
    outInputs = op.outArray("Inputs");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {};
        const inputKind = inInputKind.get();
        if (inputKind) params.inputKind = inputKind;

        obs.call('GetInputList', params)
            .then((data) => {
                if (data) {
                    outInputs.set(data.inputs || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetInputList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
