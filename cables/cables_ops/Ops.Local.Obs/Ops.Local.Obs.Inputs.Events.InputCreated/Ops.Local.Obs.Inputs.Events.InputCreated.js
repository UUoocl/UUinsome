const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Created"),
    outInputName = op.outString("Input Name"),
    outInputUuid = op.outString("Input UUID"),
    outInputKind = op.outString("Input Kind"),
    outInputSettings = op.outObject("Input Settings");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('InputCreated', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outInputName.set(data.inputName || "");
        outInputUuid.set(data.inputUuid || "");
        outInputKind.set(data.inputKind || "");
        outInputSettings.set(data.inputSettings || null);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('InputCreated', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
