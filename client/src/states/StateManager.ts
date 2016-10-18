import MenuState from "./MenuState";
import PlayState from "./PlayState";
import {State} from "./State";

export const enum StateId {
    Menu,
    Play
}

export class StateManager {
    state: State;
    states: Array<State>;

    constructor() {
        this.states = [
            new MenuState(this),
            new PlayState(this)
        ];
    }

    setState(nextState: StateId, context: Object = {}) {
        if (this.state) this.state.onExit();
        this.state = this.states[nextState];
        this.state.onEnter(context);
    }
}


