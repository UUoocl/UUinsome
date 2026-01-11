const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outTransitionDuration = op.outNumber("Transition Duration (ms)");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('CurrentSceneTransitionDurationChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outTransitionDuration.set(data.transitionDuration || 0);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('CurrentSceneTransitionDurationChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
