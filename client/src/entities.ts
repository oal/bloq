import EntityManager from "../../shared/EntityManager";
import {PlayerComponent, PlayerSelectionComponent} from "./components";
import {
    Mesh,
    BoxGeometry,
    Object3D,
    SphereGeometry,
    MeshBasicMaterial,
    MeshPhongMaterial,
    PerspectiveCamera,
    ArrowHelper,
    Vector3,
    Color,
    BoxHelper,
    LineBasicMaterial
} from 'three';
import {WallCollisionComponent} from "../../shared/components";

export function initPlayerEntity(em: EntityManager, entity: string, initialData: Object, camera: PerspectiveCamera) {
    console.log(initialData);
    // TODO: This should be cleaner.
    em.deserializeAndSetEntity(JSON.stringify({entity: entity, components: initialData}));

    let color = parseInt(entity.substr(0, 6), 16);

    let mat = new MeshPhongMaterial({color: color});

    let head = new Mesh(new SphereGeometry(0.5, 5, 5), mat);
    head.position.y = 2.5;

    let body = new Mesh(new BoxGeometry(1.5, 2, 1.1), mat);
    body.position.y = 1;

    let object = new Object3D();
    object.add(head);

    // Only current player needs a camera attached.
    if ('currentplayer' in initialData) head.add(camera);
    else object.add(body);

    // Debug helper to see how ground detection works.
    object.add(new ArrowHelper(new Vector3(0, 0, -1), new Vector3(0, 0, 0), 1));

    // Only show selection box for current player.
    if ('currentplayer' in initialData) {
        let selectionComponent = new PlayerSelectionComponent();

        // Need an underlying box for the Box helper to work.
        // Could also render this BoxGeometry in wireframe mode, but then we get diagonal lines,
        // as it renders triangles.
        let selectionGeom = new BoxGeometry(1.01, 1.01, 1.01);
        let selectionCube = new Mesh(selectionGeom, new MeshBasicMaterial());

        // Box helper will only render edges.
        let cube = new BoxHelper(selectionCube, new Color(0xffffff));
        let mat = cube.material as LineBasicMaterial;
        mat.linewidth = 4;
        mat.transparent = true;
        mat.opacity = 0.5;

        // Update and add component.
        selectionComponent.mesh = cube;
        em.addComponent(entity, selectionComponent);
    }

    let playerComponent = new PlayerComponent();
    playerComponent.mesh = object;
    em.addComponent(entity, playerComponent);

    // Add local component to track wall / block collisions.
    em.addComponent(entity, new WallCollisionComponent());
}