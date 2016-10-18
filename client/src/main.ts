import {StateManager, StateId} from "./states/StateManager";

import '../assets/stylesheets/base.scss';

let stateManager = new StateManager();

stateManager.setState(StateId.Menu);