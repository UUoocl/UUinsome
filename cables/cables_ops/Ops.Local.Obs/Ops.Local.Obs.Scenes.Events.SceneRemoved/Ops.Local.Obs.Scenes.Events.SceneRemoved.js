const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Removed"),
    outSceneName = op.outString("Scene Name"),
    outSceneUuid = op.outString("Scene UUID"),
    outIsGroup = op.outBool("Is Group");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SceneRemoved', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSceneName.set(data.sceneName || "");
        outSceneUuid.set(data.sceneUuid || "");
        outIsGroup.set(data.isGroup || false);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SceneRemoved', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
