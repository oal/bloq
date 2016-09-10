class MouseManager {
    x: number = 0;
    y: number = 0;
    private buttonsPressed: [number, number, number] =  [false, false, false];

    constructor() {
        document.addEventListener('mousemove', evt => {
            this.x += evt.movementX;
            this.y += evt.movementY;
        }, false);

        document.addEventListener('mousedown', evt => {
            this.buttonsPressed[evt.button] = true;
        }, false);

        document.addEventListener('mouseup', evt => {
            this.buttonsPressed[evt.button] = false;
        }, false);
    }

    // Return difference from last call
    delta(): [number, number] {
        let [dx, dy] = [this.x, this.y];
        this.x = 0;
        this.y = 0;
        return [dx, dy];
    }

    isLeftButtonPressed() { return this.buttonsPressed[0]; }
    isMiddleButtonPressed() { return this.buttonsPressed[1]; }
    isRightButtonPressed() { return this.buttonsPressed[2]; }
}

let singleton = new MouseManager();

export default singleton;