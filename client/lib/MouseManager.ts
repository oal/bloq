class MouseManager {
    x: number;
    y: number;

    private lastX: number;
    private lastY: number;
    private setupDone: boolean = false;

    constructor() {
        document.addEventListener('mousemove', evt => {
            this.x = evt.clientX;
            this.y = evt.clientY;

            if (!this.setupDone) {
                this.lastX = this.x;
                this.lastY = this.y;
                this.setupDone = true;
            }
        }, false);
    }

    // Return difference from last call
    delta(): [number, number] {
        if(!this.setupDone) return [0, 0];

        let deltas = [this.x - this.lastX, this.y - this.lastY];

        this.lastX = this.x;
        this.lastY = this.y;

        return deltas;
    }
}

let singleton = new MouseManager();

export default singleton;