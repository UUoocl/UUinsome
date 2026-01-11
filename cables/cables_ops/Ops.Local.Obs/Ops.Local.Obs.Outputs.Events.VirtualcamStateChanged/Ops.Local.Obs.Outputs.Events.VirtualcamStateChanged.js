const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outOutputActive = op.outBool("Output Active"),
    outOutputState = op.outString("Output State");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('VirtualcamStateChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outOutputActive.set(data.outputActive || false);
        outOutputState.set(data.outputState || "");
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('VirtualcamStateChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
