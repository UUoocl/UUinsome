const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outInputName = op.outString("Input Name"),
    outInputUuid = op.outString("Input UUID"),
    outSyncOffset = op.outNumber("Sync Offset (ms)");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('InputAudioSyncOffsetChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outInputName.set(data.inputName || "");
        outInputUuid.set(data.inputUuid || "");
        outSyncOffset.set(data.inputAudioSyncOffset || 0);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('InputAudioSyncOffsetChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
