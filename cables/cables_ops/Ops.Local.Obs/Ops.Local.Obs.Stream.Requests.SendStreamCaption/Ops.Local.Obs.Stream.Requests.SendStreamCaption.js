const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inCaptionText = op.inString("Caption Text", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const text = inCaptionText.get();
        if (!text) {
            op.logError("Caption Text is required");
            return;
        }

        obs.call('SendStreamCaption', {
            captionText: text
        })
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SendStreamCaption):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
