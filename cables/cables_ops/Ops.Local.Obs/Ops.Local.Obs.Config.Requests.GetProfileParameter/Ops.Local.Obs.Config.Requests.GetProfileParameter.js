const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inParameterCategory = op.inString("Parameter Category", ""),
    inParameterName = op.inString("Parameter Name", ""),
    outTrigger = op.outTrigger("Finished"),
    outParameterValue = op.outString("Parameter Value"),
    outDefaultParameterValue = op.outString("Default Parameter Value");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const category = inParameterCategory.get();
        const name = inParameterName.get();

        if (!category || !name) {
            op.logError("Parameter Category and Parameter Name are required");
            return;
        }

        obs.call('GetProfileParameter', {
            parameterCategory: category,
            parameterName: name
        })
            .then((data) => {
                if (data) {
                    outParameterValue.set(data.parameterValue || "");
                    outDefaultParameterValue.set(data.defaultParameterValue || "");
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetProfileParameter):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
