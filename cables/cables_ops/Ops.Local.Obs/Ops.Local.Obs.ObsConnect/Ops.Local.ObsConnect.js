const
    inIp = op.inString("IP", "localhost"),
    inPort = op.inFloat("Port", 4455),
    inPassword = op.inString("password", ""),
    inConnect = op.inBool("connect", false),
    inSubGeneral = op.inBool("Sub General", true),
    inSubConfig = op.inBool("Sub Config", true),
    inSubScenes = op.inBool("Sub Scenes Events", true),
    inSubInputs = op.inBool("Sub Inputs", true),
    inSubTransitions = op.inBool("Sub Transitions", true),
    inSubFilters = op.inBool("Sub Filters", true),
    inSubOutputs = op.inBool("Sub Outputs", true),
    inSubSceneItems = op.inBool("Sub SceneItems", true),
    inSubMediaInputs = op.inBool("Sub MediaInputs", true),
    inSubVendors = op.inBool("Sub Vendors", true),
    inSubUi = op.inBool("Sub Ui", true),
    outConnected = op.outBool("connected", false),
    outConnection = op.outObject("obsConnection", null, "obsConnection");

inSubGeneral.setUiAttribs({ group: "Event Subscriptions" });
inSubConfig.setUiAttribs({ group: "Event Subscriptions" });
inSubScenes.setUiAttribs({ group: "Event Subscriptions" });
inSubInputs.setUiAttribs({ group: "Event Subscriptions" });
inSubTransitions.setUiAttribs({ group: "Event Subscriptions" });
inSubFilters.setUiAttribs({ group: "Event Subscriptions" });
inSubOutputs.setUiAttribs({ group: "Event Subscriptions" });
inSubSceneItems.setUiAttribs({ group: "Event Subscriptions" });
inSubMediaInputs.setUiAttribs({ group: "Event Subscriptions" });
inSubVendors.setUiAttribs({ group: "Event Subscriptions" });
inSubUi.setUiAttribs({ group: "Event Subscriptions" });

globalThis.obs = null;

inConnect.onChange = updateConnection;

function updateConnection() {
    if (inConnect.get()) {
        connect();
    } else {
        disconnect();
    }
}

function connect() {
    if (globalThis.obs) return;

    let OBSWebSocket = null;

    // try to load electron version
    try {
        const pkg = op.require("obs-websocket-js");
        OBSWebSocket = pkg.default || pkg;
    } catch (e) {
        // failed
    }

    // try to load web version from global scope (loaded via libs in json)
    if (!OBSWebSocket && typeof globalThis.OBSWebSocket !== 'undefined') {
        OBSWebSocket = globalThis.OBSWebSocket;
    }

    if (!OBSWebSocket) {
        op.logError("OBSWebSocket library not loaded");
        return;
    }

    globalThis.obs = new OBSWebSocket();

    const EventSubscription = OBSWebSocket.EventSubscription || {
        General: 1,
        Config: 2,
        Scenes: 4,
        Inputs: 8,
        Transitions: 16,
        Filters: 32,
        Outputs: 64,
        SceneItems: 128,
        MediaInputs: 256,
        Vendors: 512,
        Ui: 1024
    };

    let subs = 0;
    if (inSubGeneral.get()) subs |= EventSubscription.General;
    if (inSubConfig.get()) subs |= EventSubscription.Config;
    if (inSubScenes.get()) subs |= EventSubscription.Scenes;
    if (inSubInputs.get()) subs |= EventSubscription.Inputs;
    if (inSubTransitions.get()) subs |= EventSubscription.Transitions;
    if (inSubFilters.get()) subs |= EventSubscription.Filters;
    if (inSubOutputs.get()) subs |= EventSubscription.Outputs;
    if (inSubSceneItems.get()) subs |= EventSubscription.SceneItems;
    if (inSubMediaInputs.get()) subs |= EventSubscription.MediaInputs;
    if (inSubVendors.get()) subs |= EventSubscription.Vendors;
    if (inSubUi.get()) subs |= EventSubscription.Ui;

    const url = "ws://" + inIp.get() + ":" + inPort.get();

    globalThis.obs.connect(url, inPassword.get(), {
        eventSubscriptions: subs
    })
        .then(() => {
            outConnected.set(true);
            outConnection.set(globalThis.obs);
            op.setUiAttrib({ extendTitle: "connected" });
        })
        .catch((err) => {
            op.logError("OBS Connection Error:", err);
            disconnect();
        });

    globalThis.obs.on('ConnectionClosed', () => {
        outConnected.set(false);
        outConnection.set(null);
        globalThis.obs = null;
        op.setUiAttrib({ extendTitle: "disconnected" });
    });
}

function disconnect() {
    if (globalThis.obs) {
        if (typeof globalThis.obs.disconnect === 'function') {
            try {
                globalThis.obs.disconnect();
            } catch(e) {
                console.warn("Error disconnecting OBS", e);
            }
        }
        globalThis.obs = null;
    }
    outConnected.set(false);
    outConnection.set(null);
    op.setUiAttrib({ extendTitle: "disconnected" });
}