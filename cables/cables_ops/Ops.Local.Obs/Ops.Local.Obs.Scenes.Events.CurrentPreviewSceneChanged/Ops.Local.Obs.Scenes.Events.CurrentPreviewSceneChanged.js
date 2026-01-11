const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outSceneName = op.outString("Scene Name"),
    outSceneUuid = op.outString("Scene UUID");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('CurrentPreviewSceneChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSceneName.set(data.sceneName || "");
        outSceneUuid.set(data.sceneUuid || "");
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('CurrentPreviewSceneChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
