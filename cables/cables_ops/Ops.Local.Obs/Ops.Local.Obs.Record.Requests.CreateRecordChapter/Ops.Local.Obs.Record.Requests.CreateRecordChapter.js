const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inChapterName = op.inString("Chapter Name", ""),
    outTrigger = op.outTrigger("Finished");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const name = inChapterName.get();
        const params = {};
        if (name) params.chapterName = name;

        obs.call('CreateRecordChapter', params)
            .then(() => {
                outTrigger.trigger();
            })
            .catch((err) => {
                op.logError("OBS Request Error (CreateRecordChapter):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
