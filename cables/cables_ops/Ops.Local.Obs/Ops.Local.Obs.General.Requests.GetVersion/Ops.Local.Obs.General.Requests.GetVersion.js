const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    outTrigger = op.outTrigger("Finished"),
    outObsVersion = op.outString("OBS Version"),
    outObsWebSocketVersion = op.outString("OBS WebSocket Version"),
    outRpcVersion = op.outNumber("RPC Version"),
    outAvailableRequests = op.outArray("Available Requests"),
    outSupportedImageFormats = op.outArray("Supported Image Formats"),
    outPlatform = op.outString("Platform"),
    outPlatformDescription = op.outString("Platform Description");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        obs.call('GetVersion')
            .then((data) => {
                if (data) {
                    outObsVersion.set(data.obsVersion || "");
                    outObsWebSocketVersion.set(data.obsWebSocketVersion || "");
                    outRpcVersion.set(data.rpcVersion || 0);
                    outAvailableRequests.set(data.availableRequests || []);
                    outSupportedImageFormats.set(data.supportedImageFormats || []);
                    outPlatform.set(data.platform || "");
                    outPlatformDescription.set(data.platformDescription || "");
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetVersion):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};