import BaseWorld from "../../shared/BaseWorld";
import {registerServerComponents} from "./components";

export default class World extends BaseWorld {
    constructor() {
        super();
        registerServerComponents(this.entityManager);
    }
}