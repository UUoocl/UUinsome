const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outDesktop1 = op.outString("Desktop 1"),
    outDesktop2 = op.outString("Desktop 2"),
    outMic1 = op.outString("Mic 1"),
    outMic2 = op.outString("Mic 2"),
    outMic3 = op.outString("Mic 3"),
    outMic4 = op.outString("Mic 4");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetSpecialInputs')
            .then((data) => {
                if (data) {
                    outDesktop1.set(data.desktop1 || "");
                    outDesktop2.set(data.desktop2 || "");
                    outMic1.set(data.mic1 || "");
                    outMic2.set(data.mic2 || "");
                    outMic3.set(data.mic3 || "");
                    outMic4.set(data.mic4 || "");
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSpecialInputs):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
