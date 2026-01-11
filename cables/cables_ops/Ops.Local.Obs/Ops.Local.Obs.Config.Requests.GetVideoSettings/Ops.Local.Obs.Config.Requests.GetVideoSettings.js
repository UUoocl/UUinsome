const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outBaseWidth = op.outNumber("Base Width"),
    outBaseHeight = op.outNumber("Base Height"),
    outOutputWidth = op.outNumber("Output Width"),
    outOutputHeight = op.outNumber("Output Height"),
    outFpsNumerator = op.outNumber("FPS Numerator"),
    outFpsDenominator = op.outNumber("FPS Denominator");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetVideoSettings')
            .then((data) => {
                if (data) {
                    outBaseWidth.set(data.baseWidth || 0);
                    outBaseHeight.set(data.baseHeight || 0);
                    outOutputWidth.set(data.outputWidth || 0);
                    outOutputHeight.set(data.outputHeight || 0);
                    outFpsNumerator.set(data.fpsNumerator || 0);
                    outFpsDenominator.set(data.fpsDenominator || 0);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetVideoSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
