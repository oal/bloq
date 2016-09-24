import MouseManager from '../../lib/MouseManager';
import * as Keymaster from 'keymaster';

import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {InputComponent, RotationComponent} from "../../../shared/components";
import {PlayerSelectionComponent} from "../components";
import EntityManager from "../../../shared/EntityManager";


export default class PlayerInputSystem extends System {
    mouseManager: MouseManager;

    constructor(em: EntityManager, mm: MouseManager) {
        super(em);
        this.mouseManager = mm;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.CurrentPlayer).forEach((component, entity) => {
            // Keyboard
            let input = this.entityManager.getComponent(entity, ComponentId.Input) as InputComponent;

            let moveForward = Keymaster.isPressed('W'.charCodeAt(0));
            let moveLeft = Keymaster.isPressed('A'.charCodeAt(0));
            let moveRight = Keymaster.isPressed('D'.charCodeAt(0));
            let moveBackward = Keymaster.isPressed('S'.charCodeAt(0));
            let jump = Keymaster.isPressed(' '.charCodeAt(0));

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

            // Mouse movement
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
        })
    }
}