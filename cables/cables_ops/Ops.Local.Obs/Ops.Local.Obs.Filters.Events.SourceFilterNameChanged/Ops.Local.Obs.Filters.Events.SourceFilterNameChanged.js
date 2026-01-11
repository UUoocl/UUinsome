const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outSourceName = op.outString("Source Name"),
    outOldFilterName = op.outString("Old Filter Name"),
    outFilterName = op.outString("New Filter Name");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SourceFilterNameChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSourceName.set(data.sourceName || "");
        outOldFilterName.set(data.oldFilterName || "");
        outFilterName.set(data.filterName || "");
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SourceFilterNameChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
