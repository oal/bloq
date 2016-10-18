import {StateId, StateManager} from "./StateManager";

export class State {
    private stateManager: StateManager;

    constructor(stateManager: StateManager) {
        this.stateManager = stateManager;
    }

    transitionTo(nextState: StateId, context?: Object) {
        this.stateManager.setState(nextState, context);
    }

    onEnter(context?: Object) {

    }

    onExit() {

    }
}