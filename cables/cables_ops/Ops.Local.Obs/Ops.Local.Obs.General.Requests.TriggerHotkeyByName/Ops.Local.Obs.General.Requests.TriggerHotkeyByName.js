const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inHotkeyName = op.inString("Hotkey Name", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const hotkeyName = inHotkeyName.get();
        if (!hotkeyName) {
            op.logError("Hotkey Name is required");
            return;
        }

        obs.call('TriggerHotkeyByName', {
            hotkeyName: hotkeyName
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (TriggerHotkeyByName):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
