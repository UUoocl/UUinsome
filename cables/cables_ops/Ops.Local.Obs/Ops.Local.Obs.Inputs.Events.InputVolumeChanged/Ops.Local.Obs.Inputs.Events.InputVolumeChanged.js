const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outInputName = op.outString("Input Name"),
    outInputUuid = op.outString("Input UUID"),
    outVolumeMul = op.outNumber("Volume Multiplier"),
    outVolumeDb = op.outNumber("Volume dB");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('InputVolumeChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outInputName.set(data.inputName || "");
        outInputUuid.set(data.inputUuid || "");
        outVolumeMul.set(data.inputVolumeMul || 0);
        outVolumeDb.set(data.inputVolumeDb || 0);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('InputVolumeChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
