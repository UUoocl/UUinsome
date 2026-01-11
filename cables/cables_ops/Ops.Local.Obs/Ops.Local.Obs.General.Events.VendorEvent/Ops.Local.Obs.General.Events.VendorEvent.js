const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outVendorName = op.outString("Vendor Name"),
    outEventType = op.outString("Event Type"),
    outEventData = op.outObject("Event Data");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('VendorEvent', onVendorEvent);
    }
};

function onVendorEvent(data) {
    if (data) {
        outVendorName.set(data.vendorName || "");
        outEventType.set(data.eventType || "");
        outEventData.set(data.eventData || null);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('VendorEvent', onVendorEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
