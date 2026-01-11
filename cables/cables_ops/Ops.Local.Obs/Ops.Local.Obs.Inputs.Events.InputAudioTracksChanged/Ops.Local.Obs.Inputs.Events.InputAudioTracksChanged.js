const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    outTrigger = op.outTrigger("Changed"),
    outInputName = op.outString("Input Name"),
    outInputUuid = op.outString("Input UUID"),
    outAudioTracks = op.outObject("Audio Tracks");

let obs = null;

inConnection.onChange = () => {
    removeListener();
    obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.on === 'function') {
        obs.on('InputAudioTracksChanged', onEvent);
    }
};

function onEvent(data) {
    if (data) {
        outInputName.set(data.inputName || "");
        outInputUuid.set(data.inputUuid || "");
        outAudioTracks.set(data.inputAudioTracks || null);
        outTrigger.trigger();
    }
}

function removeListener() {
    if (obs && typeof obs.off === 'function') {
        obs.off('InputAudioTracksChanged', onEvent);
    }
}

op.onDelete = () => {
    removeListener();
};
