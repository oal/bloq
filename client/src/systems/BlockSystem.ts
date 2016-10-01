import {ShaderMaterial} from 'three';

import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {RotationComponent} from "../../../shared/components";
import EntityManager from "../../../shared/EntityManager";
import {MeshComponent} from "../components";


export default class BlockSystem extends System {
    material: ShaderMaterial;
    time: number = 0;

    constructor(em: EntityManager, material: ShaderMaterial) {
        super(em);
        this.material = material;
    }

    update(dt: number) {

        this.entityManager.getEntities(ComponentId.Block).forEach((component, entity) => {
            // TODO: Move this into entities.ts so material is set when block is created. Can't currently pass more arguments there,
            // but with the event system for Server in place, it should be easy.
            let meshComponent = this.entityManager.getComponent<MeshComponent>(entity, ComponentId.Mesh);
            if(meshComponent && meshComponent.mesh.material !== this.material) {
                meshComponent.mesh.material.dispose();
                meshComponent.mesh.material = this.material;
            }

            let rotComponent = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
            rotComponent.x += dt / 2.0;
            rotComponent.y += dt;
        });
        this.time += dt;
    }
}