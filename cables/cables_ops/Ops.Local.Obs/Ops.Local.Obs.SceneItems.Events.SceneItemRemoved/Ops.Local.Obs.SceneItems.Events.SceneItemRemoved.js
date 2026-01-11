const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Removed"),
    outSceneName = op.outString("Scene Name"),
    outSceneUuid = op.outString("Scene UUID"),
    outSourceName = op.outString("Source Name"),
    outSourceUuid = op.outString("Source UUID"),
    outSceneItemId = op.outNumber("Scene Item ID");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SceneItemRemoved', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSceneName.set(data.sceneName || "");
        outSceneUuid.set(data.sceneUuid || "");
        outSourceName.set(data.sourceName || "");
        outSourceUuid.set(data.sourceUuid || "");
        outSceneItemId.set(data.sceneItemId || 0);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SceneItemRemoved', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
