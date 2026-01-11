const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outInputUuid = op.outString("Input UUID"),
    outOldInputName = op.outString("Old Input Name"),
    outInputName = op.outString("New Input Name");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('InputNameChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outInputUuid.set(data.inputUuid || "");
        outOldInputName.set(data.oldInputName || "");
        outInputName.set(data.inputName || "");
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('InputNameChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
