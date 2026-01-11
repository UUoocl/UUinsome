const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inRealm = op.inString("Realm", "OBS_WEBSOCKET_DATA_REALM_GLOBAL"),
    inSlotName = op.inString("Slot Name", ""),
    inSlotValue = op.inObject("Slot Value"),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const realm = inRealm.get();
        const slotName = inSlotName.get();
        const slotValue = inSlotValue.get();

        if (!realm || !slotName) {
            op.logError("Realm and Slot Name are required");
            return;
        }

        obs.call('SetPersistentData', {
            realm: realm,
            slotName: slotName,
            slotValue: slotValue
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetPersistentData):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
