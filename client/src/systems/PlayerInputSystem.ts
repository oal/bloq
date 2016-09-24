import MouseManager from '../../lib/MouseManager';

import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {InputComponent, RotationComponent, InventoryComponent} from "../../../shared/components";
import {PlayerSelectionComponent} from "../components";
import EntityManager from "../../../shared/EntityManager";
import KeyboardManager from "../../lib/KeyboardManager";


export default class PlayerInputSystem extends System {
    mouseManager: MouseManager;
    keyboardManager: KeyboardManager;

    constructor(em: EntityManager, mm: MouseManager, km: KeyboardManager) {
        super(em);
        this.mouseManager = mm;
        this.keyboardManager = km;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.CurrentPlayer).forEach((component, entity) => {
            // Movement related
            let input = this.entityManager.getComponent(entity, ComponentId.Input) as InputComponent;

            let moveForward = this.keyboardManager.isPressed('W');
            let moveLeft = this.keyboardManager.isPressed('A');
            let moveRight = this.keyboardManager.isPressed('D');
            let moveBackward = this.keyboardManager.isPressed('S');
            let jump = this.keyboardManager.isPressed(' ');

            if (moveForward !== input.moveForward) {
                input.moveForward = moveForward;
            }
            if (moveLeft !== input.moveLeft) {
                input.moveLeft = moveLeft;
            }
            if (moveRight !== input.moveRight) {
                input.moveRight = moveRight;
            }
            if (moveBackward !== input.moveBackward) {
                input.moveBackward = moveBackward;
            }
            if (jump !== input.jump) {
                input.jump = jump;
            }

            // Rotation
            let rot = this.entityManager.getComponent(entity, ComponentId.Rotation) as RotationComponent;
            let [dx, dy] = this.mouseManager.delta();
            if (dx !== 0) {
                rot.y -= dx / 5.0 * dt;
            }
            if (dy !== 0) {
                rot.x -= dy / 5.0 * dt;
                if (rot.x < -Math.PI / 2.0) rot.x = -Math.PI / 2.0;
                else if (rot.x > Math.PI / 2.0) rot.x = Math.PI / 2.0;
            }

            // Mouse clicks (and maybe also keypad in the future)
            let actionPrimary = this.mouseManager.isLeftButtonPressed();
            let actionSecondary = this.mouseManager.isRightButtonPressed();
            if ((actionPrimary && !input.primaryAction) || (actionSecondary && !input.secondaryAction)) {
                let selectionComponent = this.entityManager.getComponent(entity, ComponentId.PlayerSelection) as PlayerSelectionComponent;
                input.target = selectionComponent.target;
                input.targetSide = selectionComponent.targetSide;
            }
            if (actionPrimary !== input.primaryAction) {
                input.primaryAction = actionPrimary;
            }
            if (actionSecondary !== input.secondaryAction) {
                input.secondaryAction = actionSecondary;
            }

            // Inventory
            let inventory = this.entityManager.getComponent(entity, ComponentId.Inventory) as InventoryComponent;
            ['1','2','3','4','5','6','7','8','9','0'].forEach(numKey => {
                if(this.keyboardManager.isPressed(numKey)) {
                    // 0 is the rightmost slot, so we need to adjust by one.
                    inventory.activeSlot = (parseInt(numKey)+9)%10;
                }
            })
        })
    }
}