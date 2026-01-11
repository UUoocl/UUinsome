const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outSourceName = op.outString("Source Name"),
    outFilterName = op.outString("Filter Name"),
    outFilterSettings = op.outObject("Filter Settings");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('SourceFilterSettingsChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outSourceName.set(data.sourceName || "");
        outFilterName.set(data.filterName || "");
        outFilterSettings.set(data.filterSettings || null);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('SourceFilterSettingsChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
