const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inUnversioned = op.inBool("Unversioned", false),
    outTrigger = op.outTrigger("Finished"),
    outInputKinds = op.outArray("Input Kinds");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {
            unversioned: inUnversioned.get()
        };

        obs.call('GetInputKindList', params)
            .then((data) => {
                if (data) {
                    outInputKinds.set(data.inputKinds || []);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetInputKindList):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
