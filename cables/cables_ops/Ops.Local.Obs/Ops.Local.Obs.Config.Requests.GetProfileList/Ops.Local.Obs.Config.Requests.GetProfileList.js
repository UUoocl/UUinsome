const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outCurrentProfileName = op.outString("Current Profile Name"),
    outProfiles = op.outArray("Profiles");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetProfileList')
            .then((data) => {
                if (data) {
                    outCurrentProfileName.set(data.currentProfileName || "");
                    outProfiles.set(data.profiles || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetProfileList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
