const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inFpsNumerator = op.inInt("FPS Numerator", 0),
    inFpsDenominator = op.inInt("FPS Denominator", 0),
    inBaseWidth = op.inInt("Base Width", 0),
    inBaseHeight = op.inInt("Base Height", 0),
    inOutputWidth = op.inInt("Output Width", 0),
    inOutputHeight = op.inInt("Output Height", 0),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {};
        const fpsNum = inFpsNumerator.get();
        const fpsDen = inFpsDenominator.get();
        const baseW = inBaseWidth.get();
        const baseH = inBaseHeight.get();
        const outW = inOutputWidth.get();
        const outH = inOutputHeight.get();

        if (fpsNum >= 1) params.fpsNumerator = fpsNum;
        if (fpsDen >= 1) params.fpsDenominator = fpsDen;
        if (baseW >= 1 && baseW <= 4096) params.baseWidth = baseW;
        if (baseH >= 1 && baseH <= 4096) params.baseHeight = baseH;
        if (outW >= 1 && outW <= 4096) params.outputWidth = outW;
        if (outH >= 1 && outH <= 4096) params.outputHeight = outH;

        obs.call('SetVideoSettings', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (SetVideoSettings):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
