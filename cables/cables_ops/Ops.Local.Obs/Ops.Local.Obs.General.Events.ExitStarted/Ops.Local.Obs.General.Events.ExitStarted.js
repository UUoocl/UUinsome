const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Started");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('ExitStarted', onEvent);
    }
};

function onEvent() {
    outTrigger.trigger();
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('ExitStarted', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
