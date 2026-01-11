const
    inConnection = op.inObject("obsConnection", null, "obsConnection"),
    inCall = op.inTrigger("Call"),
    inSourceName = op.inString("Source Name", ""),
    inSourceUuid = op.inString("Source UUID", ""),
    inImageFormat = op.inString("Image Format", "png"),
    inImageWidth = op.inInt("Image Width", 0),
    inImageHeight = op.inInt("Image Height", 0),
    inImageCompressionQuality = op.inInt("Image Compression Quality", -1),
    outTrigger = op.outTrigger("Finished"),
    outImageData = op.outString("Image Data (Base64)");

inCall.onTriggered = () => {
    const obs = inConnection.get() || globalThis.obs;
    if (obs && typeof obs.call === 'function') {
        const sourceName = inSourceName.get();
        const sourceUuid = inSourceUuid.get();
        const imageFormat = inImageFormat.get();
        const imageWidth = inImageWidth.get();
        const imageHeight = inImageHeight.get();
        const imageCompressionQuality = inImageCompressionQuality.get();

        const params = {
            imageFormat: imageFormat
        };

        if (sourceName) params.sourceName = sourceName;
        if (sourceUuid) params.sourceUuid = sourceUuid;
        if (imageWidth >= 8 && imageWidth <= 4096) params.imageWidth = imageWidth;
        if (imageHeight >= 8 && imageHeight <= 4096) params.imageHeight = imageHeight;
        if (imageCompressionQuality >= -1 && imageCompressionQuality <= 100) params.imageCompressionQuality = imageCompressionQuality;

        obs.call('GetSourceScreenshot', params)
            .then((data) => {
                if (data) {
                    outImageData.set(data.imageData || "");
                    outTrigger.trigger();
                }
            })
            .catch((err) => {
                op.logError("OBS Request Error (GetSourceScreenshot):", err);
            });
    } else {
        op.logError("OBS not connected");
    }
};