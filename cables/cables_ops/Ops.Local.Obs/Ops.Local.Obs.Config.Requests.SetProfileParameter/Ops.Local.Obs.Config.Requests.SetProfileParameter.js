const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inParameterCategory = op.inString("Parameter Category", ""),
    inParameterName = op.inString("Parameter Name", ""),
    inParameterValue = op.inString("Parameter Value", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const category = inParameterCategory.get();
        const name = inParameterName.get();
        const value = inParameterValue.get();

        if (!category || !name) {
            op.logError("Parameter Category and Parameter Name are required");
            return;
        }

        obs.call('SetProfileParameter', {
            parameterCategory: category,
            parameterName: name,
            parameterValue: value === "" ? null : value
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetProfileParameter):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
