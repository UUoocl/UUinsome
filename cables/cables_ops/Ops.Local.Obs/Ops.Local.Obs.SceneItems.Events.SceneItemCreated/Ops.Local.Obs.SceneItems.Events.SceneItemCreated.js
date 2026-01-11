const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Created"),
    outSceneName = op.outString("Scene Name"),
    outSceneUuid = op.outString("Scene UUID"),
    outSourceName = op.outString("Source Name"),
    outSourceUuid = op.outString("Source UUID"),
    outSceneItemId = op.outNumber("Scene Item ID"),
    outSceneItemIndex = op.outNumber("Scene Item Index");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SceneItemCreated', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSceneName.set(data.sceneName || "");
        outSceneUuid.set(data.sceneUuid || "");
        outSourceName.set(data.sourceName || "");
        outSourceUuid.set(data.sourceUuid || "");
        outSceneItemId.set(data.sceneItemId || 0);
        outSceneItemIndex.set(data.sceneItemIndex || 0);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SceneItemCreated', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
