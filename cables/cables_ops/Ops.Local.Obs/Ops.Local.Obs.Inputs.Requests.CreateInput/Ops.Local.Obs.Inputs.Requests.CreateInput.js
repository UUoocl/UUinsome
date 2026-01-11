const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSceneName = op.inString("Scene Name", ""),
    inSceneUuid = op.inString("Scene UUID", ""),
    inInputName = op.inString("Input Name", ""),
    inInputKind = op.inString("Input Kind", ""),
    inInputSettings = op.inObject("Input Settings"),
    inSceneItemEnabled = op.inBool("Scene Item Enabled", true),
    outTrigger = op.outTrigger("Finished"),
    outInputUuid = op.outString("Input UUID"),
    outSceneItemId = op.outNumber("Scene Item ID");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const inputName = inInputName.get();
        const inputKind = inInputKind.get();

        if (!inputName || !inputKind) {
            op.logError("Input Name and Input Kind are required");
            return;
        }

        const params = {
            inputName: inputName,
            inputKind: inputKind,
            sceneItemEnabled: inSceneItemEnabled.get()
        };

        const sceneName = inSceneName.get();
        const sceneUuid = inSceneUuid.get();
        if (sceneName) params.sceneName = sceneName;
        if (sceneUuid) params.sceneUuid = sceneUuid;

        const inputSettings = inInputSettings.get();
        if (inputSettings) params.inputSettings = inputSettings;

        obs.call('CreateInput', params)
            .then((data) => {
                if (data) {
                    outInputUuid.set(data.inputUuid || "");
                    outSceneItemId.set(data.sceneItemId || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (CreateInput):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
