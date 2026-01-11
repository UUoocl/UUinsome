const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outInputName = op.outString("Input Name"),
    outInputUuid = op.outString("Input UUID"),
    outVideoActive = op.outBool("Video Active");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('InputActiveStateChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outInputName.set(data.inputName || "");
        outInputUuid.set(data.inputUuid || "");
        outVideoActive.set(data.videoActive || false);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('InputActiveStateChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
