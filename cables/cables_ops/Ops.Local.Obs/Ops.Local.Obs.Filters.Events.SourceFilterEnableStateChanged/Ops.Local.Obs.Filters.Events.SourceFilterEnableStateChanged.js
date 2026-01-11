const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outSourceName = op.outString("Source Name"),
    outFilterName = op.outString("Filter Name"),
    outFilterEnabled = op.outBool("Filter Enabled");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SourceFilterEnableStateChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSourceName.set(data.sourceName || "");
        outFilterName.set(data.filterName || "");
        outFilterEnabled.set(data.filterEnabled || false);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SourceFilterEnableStateChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
