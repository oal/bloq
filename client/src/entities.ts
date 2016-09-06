import EntityManager from "../../shared/EntityManager";
import {PlayerComponent} from "./components";
import {Mesh, BoxGeometry, Object3D, SphereGeometry, MeshBasicMaterial, PerspectiveCamera, ArrowHelper, Vector3} from 'three';
import {WallCollisionComponent} from "../../shared/components";

export function initPlayerEntity(em: EntityManager, entity: string, initialData: Object, camera: PerspectiveCamera) {
    console.log(initialData);
    // TODO: This should be cleaner.
    em.deserializeAndSetEntity(JSON.stringify({entity: entity, components: initialData}));

    let color = parseInt(entity.substr(0, 6), 16);

    let mat = new MeshBasicMaterial({color: color});

    let head = new Mesh(new SphereGeometry(0.5, 5, 5), mat);
    head.position.y = 2.5;



    let body = new Mesh(new BoxGeometry(1.5, 2, 1.1), mat);
    body.position.y = 1;


    let mesh = new Object3D();
    mesh.add(head);
    if('currentplayer' in initialData) head.add(camera);
    else mesh.add(body);

    mesh.add(new ArrowHelper(new Vector3(0, 0, -1), new Vector3(0, 0, 0), 1));



    let playerComponent = new PlayerComponent();
    playerComponent.mesh = mesh;
    em.addComponent(entity, playerComponent);

    // Add local component to track wall / block collisions.
    em.addComponent(entity, new WallCollisionComponent());
}