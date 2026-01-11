const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outProfileName = op.outString("Profile Name");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('CurrentProfileChanging', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outProfileName.set(data.profileName || "");
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('CurrentProfileChanging', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
