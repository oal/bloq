import StateManager from "./states/StateManager";
import MenuState from "./states/MenuState";

import '../assets/stylesheets/base.scss';

let stateManager = new StateManager();
stateManager.setState(new MenuState());