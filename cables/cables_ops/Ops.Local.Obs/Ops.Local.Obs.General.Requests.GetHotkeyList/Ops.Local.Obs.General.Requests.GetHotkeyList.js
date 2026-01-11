const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outHotkeys = op.outArray("Hotkeys");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetHotkeyList')
            .then((data) => {
                if (data) {
                    outHotkeys.set(data.hotkeys || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetHotkeyList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
