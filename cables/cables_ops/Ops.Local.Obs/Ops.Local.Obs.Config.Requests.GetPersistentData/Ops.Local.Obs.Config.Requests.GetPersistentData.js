const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inRealm = op.inString("Realm", "OBS_WEBSOCKET_DATA_REALM_GLOBAL"),
    inSlotName = op.inString("Slot Name", ""),
    outTrigger = op.outTrigger("Finished"),
    outSlotValue = op.outObject("Slot Value");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const realm = inRealm.get();
        const slotName = inSlotName.get();

        if (!realm || !slotName) {
            op.logError("Realm and Slot Name are required");
            return;
        }

        obs.call('GetPersistentData', {
            realm: realm,
            slotName: slotName
        })
            .then((data) => {
                if (data) {
                    outSlotValue.set(data.slotValue);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetPersistentData):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
