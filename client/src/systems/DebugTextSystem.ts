import {System} from "../../../shared/systems";
import {PositionComponent, RotationComponent, OnGroundComponent} from "../../../shared/components";
import {ComponentId, TERRAIN_CHUNK_SIZE} from "../../../shared/constants";
import {mod} from "../../../shared/helpers";
import {PlayerSelectionComponent} from "../components";


export default class DebugTextSystem extends System {
    domEl = null;

    update(dt: number): any {
        if (!this.domEl) {
            this.domEl = document.createElement('pre');
            this.domEl.style.position = 'absolute';
            this.domEl.style.backgroundColor = 'rgba(255,255,255,0.4)';
            this.domEl.style.bottom = '0';
            this.domEl.style.right = '0';
            this.domEl.style.margin = '0';
            this.domEl.style.padding = '10px';
            this.domEl.style.minWidth = '250px';
            this.domEl.style.fontWeight = 'bold';
            document.body.appendChild(this.domEl);
        }

        let playerEntity = this.entityManager.getEntities(ComponentId.CurrentPlayer).keys().next().value;
        let positionComponent = this.entityManager.getComponent(playerEntity, ComponentId.Position) as PositionComponent;
        if (!positionComponent) return;

        let rotationComponent = this.entityManager.getComponent(playerEntity, ComponentId.Rotation) as RotationComponent;
        let selectionComponent = this.entityManager.getComponent(playerEntity, ComponentId.PlayerSelection) as PlayerSelectionComponent;

        let onGroundComponent = this.entityManager.getComponent(playerEntity, ComponentId.OnGround) as OnGroundComponent;


        let [cx, cy, cz] = positionComponent.toChunk();

        this.domEl.innerText = `Player:   ${playerEntity}
Chunk:    ${cx} x ${cy} x ${cz}

Global: x: ${positionComponent.x.toFixed(2)} | y: ${positionComponent.y.toFixed(2)} | z: ${positionComponent.z.toFixed(2)}
Local:  x: ${mod(positionComponent.x, TERRAIN_CHUNK_SIZE).toFixed(2)} | y: ${mod(positionComponent.y, TERRAIN_CHUNK_SIZE).toFixed(2)} | z: ${mod(positionComponent.z, TERRAIN_CHUNK_SIZE).toFixed(2)}

On ground: ${!!onGroundComponent} | can jump: ${!!onGroundComponent && onGroundComponent.canJump}

Target: x: ${selectionComponent.target[0]} | y: ${selectionComponent.target[1]} | z: ${selectionComponent.target[2]}

Rotation: x: ${rotationComponent.x.toFixed(2)} | y: ${rotationComponent.y.toFixed(2)} | z: ${rotationComponent.z.toFixed(2)}
`;
    }
}