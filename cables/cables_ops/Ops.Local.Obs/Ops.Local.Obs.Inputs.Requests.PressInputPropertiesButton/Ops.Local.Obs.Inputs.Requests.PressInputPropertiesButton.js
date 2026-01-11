const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    inPropertyName = op.inString("Property Name", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const propertyName = inPropertyName.get();
        if (!propertyName) {
            op.logError("Property Name is required");
            return;
        }

        const params = {
            propertyName: propertyName
        };
        const inputName = inInputName.get();
        const inputUuid = inInputUuid.get();

        if (inputName) params.inputName = inputName;
        if (inputUuid) params.inputUuid = inputUuid;

        if (!inputName && !inputUuid) {
            op.logError("Input Name or Input UUID is required");
            return;
        }

        obs.call('PressInputPropertiesButton', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (PressInputPropertiesButton):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
