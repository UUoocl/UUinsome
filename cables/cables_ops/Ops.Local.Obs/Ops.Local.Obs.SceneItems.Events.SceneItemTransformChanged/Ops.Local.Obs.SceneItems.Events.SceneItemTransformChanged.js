const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outSceneName = op.outString("Scene Name"),
    outSceneUuid = op.outString("Scene UUID"),
    outSceneItemId = op.outNumber("Scene Item ID"),
    outSceneItemTransform = op.outObject("Scene Item Transform");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SceneItemTransformChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSceneName.set(data.sceneName || "");
        outSceneUuid.set(data.sceneUuid || "");
        outSceneItemId.set(data.sceneItemId || 0);
        outSceneItemTransform.set(data.sceneItemTransform || null);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SceneItemTransformChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
