const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outSceneCollectionName = op.outString("Scene Collection Name");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('CurrentSceneCollectionChanging', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSceneCollectionName.set(data.sceneCollectionName || "");
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('CurrentSceneCollectionChanging', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
