const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outScenes = op.outArray("Scenes");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SceneListChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outScenes.set(data.scenes || []);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SceneListChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
