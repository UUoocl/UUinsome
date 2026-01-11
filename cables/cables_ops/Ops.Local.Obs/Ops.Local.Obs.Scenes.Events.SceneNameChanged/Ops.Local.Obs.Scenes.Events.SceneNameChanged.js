const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outSceneUuid = op.outString("Scene UUID"),
    outOldSceneName = op.outString("Old Scene Name"),
    outSceneName = op.outString("New Scene Name");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SceneNameChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSceneUuid.set(data.sceneUuid || "");
        outOldSceneName.set(data.oldSceneName || "");
        outSceneName.set(data.sceneName || "");
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SceneNameChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
