const
    inSseObj = op.inObject("SSE Object", null, "sseConnection"),
    outTrigger = op.outTrigger("Received"),
    outData = op.outString("Data"),
    outLastId = op.outString("Last Event ID");

op.lastSseObj = null;

inSseObj.onChange = update;

function update() {
    removeListener();
    op.lastSseObj = inSseObj.get();
    if (op.lastSseObj && typeof op.lastSseObj.addEventListener === 'function') {
        op.lastSseObj.addEventListener('message', onMessage);
    }
}

function onMessage(ev) {
    outData.set(ev.data || "");
    outLastId.set(ev.lastEventId || "");
    outTrigger.trigger();
}

function removeListener() {
    if (op.lastSseObj && typeof op.lastSseObj.removeEventListener === 'function') {
        op.lastSseObj.removeEventListener('message', onMessage);
    }
}

op.onDelete = () => {
    removeListener();
};