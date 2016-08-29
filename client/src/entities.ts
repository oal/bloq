
import EntityManager from "../../shared/EntityManager";
import {MeshComponent} from "./components";
import {Mesh, BoxGeometry, MeshBasicMaterial} from 'three';

export function initPlayerEntity(em: EntityManager, entity: string, initialData: Object) {
    // TODO: This should be cleaner.
    em.deserializeAndSetEntity(JSON.stringify({entity: entity, components: initialData}));

    let color = parseInt(entity.substr(0, 6), 16);

    let geom = new BoxGeometry(1.5, 2.8, 1.25);
    let mat = new MeshBasicMaterial({color: color});
    let mesh = new Mesh(geom, mat);

    let meshComponent = new MeshComponent();
    meshComponent.mesh = mesh;
    em.addComponent(entity, meshComponent);
}