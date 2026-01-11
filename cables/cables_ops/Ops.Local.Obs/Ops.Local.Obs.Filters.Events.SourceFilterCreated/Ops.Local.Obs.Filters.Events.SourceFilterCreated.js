const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Created"),
    outSourceName = op.outString("Source Name"),
    outFilterName = op.outString("Filter Name"),
    outFilterKind = op.outString("Filter Kind"),
    outFilterIndex = op.outNumber("Filter Index"),
    outFilterSettings = op.outObject("Filter Settings");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SourceFilterCreated', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSourceName.set(data.sourceName || "");
        outFilterName.set(data.filterName || "");
        outFilterKind.set(data.filterKind || "");
        outFilterIndex.set(data.filterIndex || 0);
        outFilterSettings.set(data.filterSettings || null);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SourceFilterCreated', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
