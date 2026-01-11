const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outInputName = op.outString("Input Name"),
    outInputUuid = op.outString("Input UUID"),
    outInputSettings = op.outObject("Input Settings");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('InputSettingsChanged', onSettingsChanged);
    }
};

function onSettingsChanged(data) {
    if (data) {
        outInputName.set(data.inputName || "");
        outInputUuid.set(data.inputUuid || "");
        outInputSettings.set(data.inputSettings || null);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('InputSettingsChanged', onSettingsChanged);
    }
}

op.onDelete = () => {
    removeListener();
};
