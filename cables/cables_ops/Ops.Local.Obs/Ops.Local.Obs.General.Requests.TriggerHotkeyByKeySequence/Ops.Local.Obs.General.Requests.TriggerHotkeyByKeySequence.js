const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inKeyId = op.inString("Key ID", ""),
    inShift = op.inBool("Shift", false),
    inControl = op.inBool("Control", false),
    inAlt = op.inBool("Alt", false),
    inCommand = op.inBool("Command (Mac)", false),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const keyId = inKeyId.get();
        const keyModifiers = {
            shift: inShift.get(),
            control: inControl.get(),
            alt: inAlt.get(),
            command: inCommand.get()
        };

        const params = {};
        if (keyId) params.keyId = keyId;
        params.keyModifiers = keyModifiers;

        obs.call('TriggerHotkeyByKeySequence', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (TriggerHotkeyByKeySequence):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
