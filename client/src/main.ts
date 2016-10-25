import StateManager from "./states/StateManager";

import '../assets/stylesheets/base.scss';
import AssetLoadingState from "./states/AssetLoadingState";

let stateManager = new StateManager();
stateManager.setState(new AssetLoadingState());