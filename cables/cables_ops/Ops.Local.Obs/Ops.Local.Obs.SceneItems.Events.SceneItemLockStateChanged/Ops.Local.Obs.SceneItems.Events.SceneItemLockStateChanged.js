const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outSceneName = op.outString("Scene Name"),
    outSceneUuid = op.outString("Scene UUID"),
    outSceneItemId = op.outNumber("Scene Item ID"),
    outSceneItemLocked = op.outBool("Scene Item Locked");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SceneItemLockStateChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSceneName.set(data.sceneName || "");
        outSceneUuid.set(data.sceneUuid || "");
        outSceneItemId.set(data.sceneItemId || 0);
        outSceneItemLocked.set(data.sceneItemLocked || false);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SceneItemLockStateChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
