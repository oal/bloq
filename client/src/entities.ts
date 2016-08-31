import EntityManager from "../../shared/EntityManager";
import {MeshComponent} from "./components";
import {Mesh, BoxGeometry, Object3D, SphereGeometry, MeshBasicMaterial, Raycaster, Vector3} from 'three';

export function initPlayerEntity(em: EntityManager, entity: string, initialData: Object) {
    // TODO: This should be cleaner.
    em.deserializeAndSetEntity(JSON.stringify({entity: entity, components: initialData}));

    let color = parseInt(entity.substr(0, 6), 16);

    let mat = new MeshBasicMaterial({color: color});

    let head = new Mesh(new SphereGeometry(0.5, 5, 5), mat);
    head.position.y = 2.5;

    let body = new Mesh(new BoxGeometry(1.1, 2, 1.1), mat);
    body.position.y = 1;

    let mesh = new Object3D();
    mesh.add(head);
    mesh.add(body)

    let meshComponent = new MeshComponent();
    meshComponent.mesh = mesh;
    em.addComponent(entity, meshComponent);
}