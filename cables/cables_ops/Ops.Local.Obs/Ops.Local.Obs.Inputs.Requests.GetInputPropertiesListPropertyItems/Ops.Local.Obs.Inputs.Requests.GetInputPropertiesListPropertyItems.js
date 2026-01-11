const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inInputName = op.inString("Input Name", ""),
    inInputUuid = op.inString("Input UUID", ""),
    inPropertyName = op.inString("Property Name", ""),
    outTrigger = op.outTrigger("Finished"),
    outPropertyItems = op.outArray("Property Items");

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

        obs.call('GetInputPropertiesListPropertyItems', params)
            .then((data) => {
                if (data) {
                    outPropertyItems.set(data.propertyItems || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetInputPropertiesListPropertyItems):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
