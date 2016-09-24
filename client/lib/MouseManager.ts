export default class MouseManager {
    x: number = 0;
    y: number = 0;
    scroll: number = 0;
    private buttonsPressed: [boolean, boolean, boolean] =  [false, false, false];

    constructor(target: Element) {
        target.addEventListener('mousemove', evt => {
            this.x += evt.movementX;
            this.y += evt.movementY;
        }, false);

        target.addEventListener('mousedown', evt => {
            this.buttonsPressed[evt.button] = true;
        }, false);

        target.addEventListener('mouseup', evt => {
            this.buttonsPressed[evt.button] = false;
        }, false);

        target.addEventListener('wheel', evt => {
            if(evt.deltaY < 0) this.scroll = -1;
            else if(evt.deltaY > 0) this.scroll = 1;
        }, false);
    }

    // Return difference from last call
    delta(): [number, number, number] {
        let [dx, dy, scroll] = [this.x, this.y, this.scroll];
        this.x = 0;
        this.y = 0;
        this.scroll = 0;
        return [dx, dy, scroll];
    }

    isLeftButtonPressed() { return this.buttonsPressed[0]; }
    isMiddleButtonPressed() { return this.buttonsPressed[1]; }
    isRightButtonPressed() { return this.buttonsPressed[2]; }
}