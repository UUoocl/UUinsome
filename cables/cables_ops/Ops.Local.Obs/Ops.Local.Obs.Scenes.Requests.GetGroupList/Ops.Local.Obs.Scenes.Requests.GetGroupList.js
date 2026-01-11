const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outGroups = op.outArray("Groups");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetGroupList')
            .then((data) => {
                if (data) {
                    outGroups.set(data.groups || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetGroupList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
