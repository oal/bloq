import BaseWorld from "../../shared/BaseWorld";
import {updateKeyboard} from "./systems";

export default class World extends BaseWorld {

    tick(dt) {
        super.tick(dt);
        updateKeyboard(this.entityManager);
    }
}