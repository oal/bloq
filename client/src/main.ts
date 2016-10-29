import StateManager from "./states/StateManager";
import AssetLoadingState from "./states/AssetLoadingState";

import 'animate.css';
import '../assets/stylesheets/base.scss';

let stateManager = new StateManager();
stateManager.setState(new AssetLoadingState());