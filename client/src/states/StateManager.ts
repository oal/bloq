import {State} from "./State";

export default class StateManager {
    private state: State;
    private currentTime: number = performance.now();

    setState(nextState: State) {
        if (this.state) this.state.onExit();
        this.state = nextState;
        this.state.onEnter();

        this.update();
    }

    private update() {
        let newTime = performance.now();
        let dt = (newTime - this.currentTime) / 1000;

        let nextState = this.state.tick(dt);
        if(nextState) {
            this.setState(nextState);
        } else {
            this.currentTime = newTime;
            requestAnimationFrame(this.update.bind(this));
        }
    }
}


