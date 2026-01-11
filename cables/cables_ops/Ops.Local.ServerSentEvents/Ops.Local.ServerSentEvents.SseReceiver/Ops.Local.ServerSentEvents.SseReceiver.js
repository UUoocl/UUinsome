const
    inUrl = op.inString("URL", ""),
    inActive = op.inBool("Active", false),
    inCredentials = op.inBool("With Credentials", false),
    outConnected = op.outBool("Connected", false),
    outError = op.outTrigger("Error"),
    outSseObj = op.outObject("SSE Object", null, "sseConnection");

op.activeEventSource = null;

let NativeEventSource = globalThis.EventSource;

if (!NativeEventSource) {
    try {
        let pkg = null;
        if (typeof op.require === "function") {
            pkg = op.require("eventsource");
        } else {
            pkg = require("eventsource");
        }

        if (pkg) {
            if (typeof pkg === "function") {
                NativeEventSource = pkg;
            } else if (pkg.EventSource) {
                NativeEventSource = pkg.EventSource;
            } else if (pkg.default) {
                NativeEventSource = pkg.default;
            } else {
                NativeEventSource = pkg;
            }
        }
    } catch (e) {
        op.logWarn("EventSource not found. If running in Node/Electron, please install the 'eventsource' package.");
    }
}

inUrl.onChange =
inActive.onChange =
inCredentials.onChange = update;

function update() {
    disconnect();

    if (!inActive.get()) return;

    const url = inUrl.get();
    if (!url) return;

    if (!NativeEventSource) {
         op.logError("EventSource API is not available.");
         outError.trigger();
         return;
    }

    try {
        op.activeEventSource = new NativeEventSource(url, {
            withCredentials: inCredentials.get()
        });

        op.activeEventSource.onopen = () => {
            outConnected.set(true);
            op.setUiAttrib({ extendTitle: "connected" });
        };

        op.activeEventSource.onerror = (err) => {
            outConnected.set(false);
            outError.trigger();
            op.setUiAttrib({ extendTitle: "error" });

            let stateStr = "UNKNOWN";
            if (err.target) {
                if (err.target.readyState === 0) stateStr = "CONNECTING";
                else if (err.target.readyState === 1) stateStr = "OPEN";
                else if (err.target.readyState === 2) stateStr = "CLOSED";
            }
            op.logError("SSE Connection Error. ReadyState: " + stateStr, err);
        };

        outSseObj.set(op.activeEventSource);
    } catch (e) {
        op.logError("Failed to create EventSource:", e);
        outError.trigger();
    }
}

function disconnect() {
    if (op.activeEventSource) {
        op.activeEventSource.close();
        op.activeEventSource = null;
    }
    outConnected.set(false);
    outSseObj.set(null);
    op.setUiAttrib({ extendTitle: "disconnected" });
}

op.onDelete = () => {
    disconnect();
};
