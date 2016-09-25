import {Scene, Mesh, Vector3, Raycaster, MeshBasicMaterial, BoxGeometry} from 'three';

import {System} from "../../../shared/systems";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, Side} from "../../../shared/constants";
import {PlayerSelectionComponent, MeshComponent} from "../components";
import {PositionComponent} from "../../../shared/components";
import {globalToChunk, chunkKey} from "../../../shared/helpers";
import {findBlockMaterial} from "../helpers";


export default class PlayerSelectionSystem extends System {
    scene: Scene;
    debugSelector: Mesh;

    constructor(em: EntityManager, scene: Scene) {
        super(em);
        this.scene = scene;

        this.debugSelector = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshBasicMaterial(0xffffff));
        this.scene.add(this.debugSelector);
    }

    update(dt: number) {
        // Directional vectors. These never change.
        let xRot = new Vector3(1, 0, 0);
        let yRot = new Vector3(0, 1, 0);

        this.entityManager.getEntities(ComponentId.PlayerSelection).forEach((component, entity) => {
            // Load relevant components.
            let selectionComponent = component as PlayerSelectionComponent;
            let positionComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            let rotComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Rotation);

            // Get player's eye position, which we use for ray caster / collision detection origin.
            let [x, y, z] = [positionComponent.x, positionComponent.y + 2.5, positionComponent.z];
            let pos = new Vector3(x, y, z);

            // Used for ray caster and chunk lookup.
            let rotVec = new Vector3(0, 0, -1).applyAxisAngle(xRot, rotComponent.x).applyAxisAngle(yRot, rotComponent.y);

            let chunkKeys = []; // use Array to retain order.
            for (let i = 0.01; i <= 5.01; i++) {
                let blockVec = rotVec.clone().setLength(i).add(pos);

                // Add both rounded, floored and ceiled version of target position so we avoid all edge cases
                // (when player is in one chunk, and digs in neighbor chunk)
                let block = blockVec.roundToZero();
                let key = chunkKey(globalToChunk(block.x), globalToChunk(block.y), globalToChunk(block.z));
                if (chunkKeys.indexOf(key) === -1) chunkKeys.push(key);

                block = blockVec.floor();
                key = chunkKey(globalToChunk(block.x), globalToChunk(block.y), globalToChunk(block.z));
                if (chunkKeys.indexOf(key) === -1) chunkKeys.push(key);

                block = blockVec.ceil();
                key = chunkKey(globalToChunk(block.x), globalToChunk(block.y), globalToChunk(block.z));
                if (chunkKeys.indexOf(key) === -1) chunkKeys.push(key);
            }

            // Ray cast until we hit a block. First checks current chunk, then ones further away, if any.
            let ray = new Raycaster(pos, rotVec, 0.01, 5);
            let targetValid = false;
            for (let key of chunkKeys) {
                let meshComponent = this.entityManager.getComponent<MeshComponent>(key, ComponentId.Mesh);

                let hitSide: Side;
                let hitPoint: Vector3 = null;
                if (meshComponent && meshComponent.mesh) {
                    let hits = ray.intersectObject(meshComponent.mesh);
                    if (hits.length) {
                        let hit = hits[0];
                        let point = hit.point;

                        // DEBUG
                        this.debugSelector.position.x = point.x;
                        this.debugSelector.position.y = point.y;
                        this.debugSelector.position.z = point.z;

                        // Cube data is offset by half a unit vs raycaster hit point.
                        // For negative values, subtract -0.5, for positive, add 0.5.
                        let cubeOffset = new Vector3(
                            Math.sign(point.x) / 2.0,
                            Math.sign(point.y) / 2.0,
                            Math.sign(point.z) / 2.0
                        );

                        let normal = hit.face.normal;

                        // Find which side of the cube the player has in focus.
                        if(normal.x === 0 && normal.y === 1 && normal.z === 0) hitSide = Side.Top;
                        else if(normal.x === 0 && normal.y === 0 && normal.z === 1) hitSide = Side.North;
                        else if(normal.x === 1 && normal.y === 0 && normal.z === 0) hitSide = Side.East;
                        else if(normal.x === 0 && normal.y === 0 && normal.z === -1) hitSide = Side.South;
                        else if(normal.x === -1 && normal.y === 0 && normal.z === 0) hitSide = Side.West;
                        else if(normal.x === 0 && normal.y === -1 && normal.z === 0) hitSide = Side.Bottom;

                        // Also subtract half of normal value to reach center of cube. Top face has normal
                        // of 1 pointing upwards, so subtracting half of that gets us precisely to the center of the
                        // cube, making the selector work correctly.
                        hitPoint = point.clone().add(cubeOffset).sub(
                            normal.clone().divideScalar(2)
                        ).roundToZero();
                    }
                }

                // Did we hit the mesh during ray casting, and is there really a block there?
                if (hitPoint && findBlockMaterial(this.entityManager, hitPoint.x, hitPoint.y, hitPoint.z) !== 0) {
                    this.debugSelector.visible = true;
                    targetValid = true;
                    selectionComponent.target = [hitPoint.x, hitPoint.y, hitPoint.z];
                    selectionComponent.targetSide = hitSide;
                    selectionComponent.mesh.position.lerp(hitPoint, 0.75); // Lerp because it looks good. :-)
                    break;
                } else {
                    this.debugSelector.visible = false;
                }
            }

            // Hide if target is not valid.
            selectionComponent.targetValid = targetValid;
            selectionComponent.mesh.visible = targetValid;

            if (!selectionComponent.mesh.parent) this.scene.add(selectionComponent.mesh);
        })
    }
}