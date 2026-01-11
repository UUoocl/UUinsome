const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inVendorName = op.inString("Vendor Name", ""),
    inRequestType = op.inString("Request Type", ""),
    inRequestData = op.inObject("Request Data"),
    outTrigger = op.outTrigger("Finished"),
    outVendorName = op.outString("Vendor Name Out"),
    outRequestType = op.outString("Request Type Out"),
    outResponseData = op.outObject("Response Data");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const vendorName = inVendorName.get();
        const requestType = inRequestType.get();
        const requestData = inRequestData.get() || {};

        if (!vendorName || !requestType) {
            op.logError("Vendor Name and Request Type are required");
            return;
        }

        obs.call('CallVendorRequest', {
            vendorName: vendorName,
            requestType: requestType,
            requestData: requestData
        })
            .then((data) => {
                if (data) {
                    outVendorName.set(data.vendorName || "");
                    outRequestType.set(data.requestType || "");
                    outResponseData.set(data.responseData || null);
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (CallVendorRequest):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};
