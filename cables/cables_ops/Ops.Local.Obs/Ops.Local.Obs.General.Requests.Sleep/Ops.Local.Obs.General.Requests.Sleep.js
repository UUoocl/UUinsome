const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSleepMillis = op.inInt("Sleep Milliseconds", 0),
    inSleepFrames = op.inInt("Sleep Frames", 0),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const params = {};
        const millis = inSleepMillis.get();
        const frames = inSleepFrames.get();

        if (millis > 0) params.sleepMillis = millis;
        if (frames > 0) params.sleepFrames = frames;

        obs.call('Sleep', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (Sleep):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
