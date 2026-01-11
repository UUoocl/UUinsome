const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Ended"),
    outTransitionName = op.outString("Transition Name"),
    outTransitionUuid = op.outString("Transition UUID");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SceneTransitionEnded', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outTransitionName.set(data.transitionName || "");
        outTransitionUuid.set(data.transitionUuid || "");
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SceneTransitionEnded', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
