const
    inActive = op.inBool("Active", true),
    inEventName = op.inString("Event Name", ""),
    inUseCapture = op.inBool("Use Capture", false),
    inPassive = op.inBool("Passive", false),
    inPreventDefault = op.inBool("Prevent Default", false),
    inStopPropagation = op.inBool("Stop Propagation", false),
    outTrigger = op.outTrigger("Event Trigger"),
    outEventObj = op.outObject("Event Object");

let lastEventName = "";
let lastOptions = null;

inActive.onChange =
inEventName.onChange =
inUseCapture.onChange =
inPassive.onChange = update;

function update() {
    removeListener();
    
    if (!inActive.get()) return;

    const name = inEventName.get();
    if (!name) return;

    const options = {
        capture: inUseCapture.get(),
        passive: inPassive.get()
    };

    globalThis.addEventListener(name, handleEvent, options);
    
    lastEventName = name;
    lastOptions = options;
    
    op.setUiAttrib({ "extendTitle": name });
}

function removeListener() {
    if (lastEventName) {
        globalThis.removeEventListener(lastEventName, handleEvent, lastOptions);
        lastEventName = "";
        lastOptions = null;
    }
}

function handleEvent(ev) {
    outEventObj.set(ev);
    
    if (inPreventDefault.get()) {
        try {
            ev.preventDefault();
        } catch (e) {}
    }
    
    if (inStopPropagation.get()) {
        try {
            ev.stopPropagation();
        } catch (e) {}
    }
    
    outTrigger.trigger();
}

op.onDelete = () => {
    removeListener();
};

update();
