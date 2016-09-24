import EntityManager from "../../shared/EntityManager";
import {PlayerComponent, PlayerSelectionComponent} from "./components";
import {
    Mesh,
    BoxGeometry,
    MeshBasicMaterial,
    PerspectiveCamera,
    ArrowHelper,
    Vector3,
    Color,
    BoxHelper,
    LineBasicMaterial,
    Object3D
} from 'three';
import {ComponentId} from "../../shared/constants";
import AnimatedMesh from "./AnimatedMesh";

export function initPlayerEntity(em: EntityManager, entity: string, initialData: Object, mesh: AnimatedMesh, camera: PerspectiveCamera) {
    console.log(entity, initialData);
    // TODO: This should be cleaner.
    em.deserializeAndSetEntity(JSON.stringify({entity: entity, components: initialData}));

    // Only current player needs a camera attached.
    let playerMesh;
    if (ComponentId.CurrentPlayer in initialData) {
        playerMesh = new Object3D();
        camera.position.y = 2.5;
        playerMesh.add(camera);
    } else {
        playerMesh = mesh.clone() as AnimatedMesh
    }

    // Debug helper to see how ground detection works.
    playerMesh.add(new ArrowHelper(new Vector3(0, 0, -1), new Vector3(0, 0, 0), 1));

    // Only show selection box for current player.
    if (ComponentId.CurrentPlayer in initialData) {
        console.log('Spawning current player');
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
    playerComponent.mesh = playerMesh;
    em.addComponent(entity, playerComponent);
}