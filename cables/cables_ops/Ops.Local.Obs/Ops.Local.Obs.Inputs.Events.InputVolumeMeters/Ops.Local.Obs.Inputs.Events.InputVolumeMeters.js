const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Updated"),
    outInputs = op.outArray("Inputs");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('InputVolumeMeters', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outInputs.set(data.inputs || []);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('InputVolumeMeters', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
