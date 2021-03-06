import {Scene} from 'three';

import {System} from "../../../shared/System";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId} from "../../../shared/constants";
import {MeshComponent} from "../components";
import {PositionComponent, RotationComponent} from "../../../shared/components";


export default class MeshSystem extends System {
    scene: Scene;

    constructor(em: EntityManager, scene: Scene) {
        super(em);
        this.scene = scene;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Mesh).forEach((component, entity) => {
            let meshComponent = component as MeshComponent;
            if (!meshComponent.mesh) return; // Mesh may be null.

            let isNewMesh = false;
            if (!meshComponent.mesh.parent) {
                this.scene.add(meshComponent.mesh);
                isNewMesh = true;
            }

            let position = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            if (position && (isNewMesh || position.isDirty())) {
                meshComponent.mesh.position.x = position.x;
                meshComponent.mesh.position.y = position.y;
                meshComponent.mesh.position.z = position.z;
            }

            let rot = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
            if (rot && rot.isDirty()) {
                meshComponent.mesh.rotation.x = rot.x;
                meshComponent.mesh.rotation.y = rot.y;
                meshComponent.mesh.rotation.z = rot.z;
            }
        })
    }
}

