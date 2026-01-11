const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outSceneCollections = op.outArray("Scene Collections");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SceneCollectionListChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSceneCollections.set(data.sceneCollections || []);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SceneCollectionListChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
