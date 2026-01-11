class Monitor {
    constructor(monitorData, mapping = { sourceName: '', resolutionFactor: 1.0 }) {
        this.index = monitorData.monitorIndex;
        this.name = monitorData.monitorName;
        this.width = monitorData.monitorWidth;
        this.height = monitorData.monitorHeight;
        this.x = monitorData.monitorPositionX;
        this.y = monitorData.monitorPositionY;
        
        this.sourceName = mapping.sourceName;
        this.resolutionFactor = mapping.resolutionFactor || 1.0;
        
        this.currentState = {
            x: this.x,
            y: this.y,
            scale: 1.0
        };
        
        this.targetState = {
            x: this.x,
            y: this.y,
            scale: 1.0
        };
    }

    update(zoomLevel, viewX, viewY, stageCenterX, stageCenterY, movementType, movementSpeed) {
        if (!this.sourceName) return false;

        this.targetState.scale = zoomLevel / this.resolutionFactor;
        this.targetState.x = stageCenterX - (stageCenterX + viewX - this.x) * zoomLevel;
        this.targetState.y = stageCenterY - (stageCenterY + viewY - this.y) * zoomLevel;

        const prevX = this.currentState.x;
        const prevY = this.currentState.y;
        const prevScale = this.currentState.scale;

        if (movementType === 'smooth') {
            this.currentState.scale = lerp(this.currentState.scale, this.targetState.scale, movementSpeed);
            this.currentState.x = lerp(this.currentState.x, this.targetState.x, movementSpeed);
            this.currentState.y = lerp(this.currentState.y, this.targetState.y, movementSpeed);

            // Snap to target if very close to avoid infinite tiny movements
            if (Math.abs(this.currentState.x - this.targetState.x) < 0.1) this.currentState.x = this.targetState.x;
            if (Math.abs(this.currentState.y - this.targetState.y) < 0.1) this.currentState.y = this.targetState.y;
            if (Math.abs(this.currentState.scale - this.targetState.scale) < 0.001) this.currentState.scale = this.targetState.scale;
        } else {
            this.currentState.scale = this.targetState.scale;
            this.currentState.x = this.targetState.x;
            this.currentState.y = this.targetState.y;
        }

        // Return true if any value changed
        return (prevX !== this.currentState.x || prevY !== this.currentState.y || prevScale !== this.currentState.scale);
    }

    draw(zoomLevel) {
        if (!this.sourceName) return;

        fill(0, 122, 204, 50);
        stroke(0, 122, 204);
        strokeWeight(1);
        rect(this.currentState.x, this.currentState.y, this.width * zoomLevel, this.height * zoomLevel);
        
        fill(0);
        noStroke();
        textSize(30);
        textAlign(LEFT, TOP);
        text(this.sourceName, this.currentState.x + 10, this.currentState.y + 10);
    }
}
