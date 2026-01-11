const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Reindexed"),
    outSourceName = op.outString("Source Name"),
    outFilters = op.outArray("Filters");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SourceFilterListReindexed', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSourceName.set(data.sourceName || "");
        outFilters.set(data.filters || []);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SourceFilterListReindexed', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
