class MouseManager {
    x: number = 0;
    y: number = 0;

    constructor() {
        document.addEventListener('mousemove', evt => {
            this.x += evt.movementX;
            this.y += evt.movementY;
        }, false);
    }

    // Return difference from last call
    delta(): [number, number] {
        let [dx, dy] = [this.x, this.y];
        this.x = 0;
        this.y = 0;
        return [dx, dy];
    }
}

let singleton = new MouseManager();

export default singleton;