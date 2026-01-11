const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outProfiles = op.outArray("Profiles");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('ProfileListChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outProfiles.set(data.profiles || []);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('ProfileListChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
