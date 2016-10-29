import StateManager from "./StateManager";

export class State {
    stateManager: StateManager;

    get assetManager() {
        return this.stateManager.assetManager;
    }

    get renderer() {
        return this.stateManager.renderer;
    }

    tick(dt: number) {
    }

    onEnter() {
    }

    onExit() {
    }

    transitionTo(nextState: State) {
        this.stateManager.setState(nextState);
    }

    // Provide no-op implementations of events.
    // StateManager adds event listeners on document / window so
    // State's child classes get an easier job cleaning themselves up.
    // Avoids a lot of potential leaks.
    onResize(evt: Event) {
    }

    onPointerLockChange(evt: Event) {
    }
}