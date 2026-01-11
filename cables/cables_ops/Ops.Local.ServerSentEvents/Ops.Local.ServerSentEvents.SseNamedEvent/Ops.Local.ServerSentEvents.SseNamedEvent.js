const
    inSseObj = op.inObject("SSE Object", null, "sseConnection"),
    inEventName = op.inString("Event Name", ""),
    outTrigger = op.outTrigger("Received"),
    outData = op.outString("Data"),
    outLastId = op.outString("Last Event ID");

op.lastSseObj = null;
op.lastEventName = "";

inSseObj.onChange = 
inEventName.onChange = update;

function update() {
    removeListener();
    
    op.lastSseObj = inSseObj.get();
    op.lastEventName = inEventName.get();
    
    if (op.lastSseObj && op.lastEventName && typeof op.lastSseObj.addEventListener === 'function') {
        op.lastSseObj.addEventListener(op.lastEventName, onEvent);
        op.setUiAttrib({ "extendTitle": op.lastEventName });
    }
}

function onEvent(ev) {
    outData.set(ev.data || "");
    outLastId.set(ev.lastEventId || "");
    outTrigger.trigger();
}

function removeListener() {
    if (op.lastSseObj && op.lastEventName && typeof op.lastSseObj.removeEventListener === 'function') {
        op.lastSseObj.removeEventListener(op.lastEventName, onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
