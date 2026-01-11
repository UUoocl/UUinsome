const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Removed"),
    outSourceName = op.outString("Source Name"),
    outFilterName = op.outString("Filter Name");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SourceFilterRemoved', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSourceName.set(data.sourceName || "");
        outFilterName.set(data.filterName || "");
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SourceFilterRemoved', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
