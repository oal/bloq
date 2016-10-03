import {ShaderMaterial, Mesh} from 'three';

import Initializer from "./Initializer";
import {ComponentId} from "../../../shared/constants";
import {MeshComponent} from "../components";
import {RotationComponent, PositionComponent, BlockComponent} from "../../../shared/components";
import {buildBlockGeometry} from "../geometry/block";
import EntityManager from "../../../shared/EntityManager";


export default class BlockInitializer extends Initializer {
    material: ShaderMaterial;

    constructor(em: EntityManager, material: ShaderMaterial) {
        super(em);
        this.material = material;
    }

    initialize(entity: string, components: Object) {
        let pos = components[ComponentId.Position];
        let posComponent = new PositionComponent();
        posComponent.x = pos.x;
        posComponent.y = pos.y;
        posComponent.z = pos.z;
        this.entityManager.addComponent(entity, posComponent);


        let block = components[ComponentId.Block];
        let blockComponent = new BlockComponent();
        blockComponent.kind = block.kind|0;
        blockComponent.count = block.count;
        this.entityManager.addComponent(entity, blockComponent);

        let geom = buildBlockGeometry(blockComponent.kind);

        let meshComponent = new MeshComponent();
        meshComponent.mesh = new Mesh(geom, this.material);
        meshComponent.mesh.scale.set(0.25, 0.25, 0.25);

        this.entityManager.addComponent(entity, meshComponent);
        this.entityManager.addComponent(entity, new RotationComponent());
    }
}