const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outEventData = op.outObject("Event Data");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('CustomEvent', onCustomEvent);
    }
};

function onCustomEvent(data) {
    if (data) {
        outEventData.set(data.eventData || null);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('CustomEvent', onCustomEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
