import {
    LineBasicMaterial,
    Color,
    MeshBasicMaterial,
    BoxGeometry,
    Vector3,
    Object3D,
    ArrowHelper,
    Mesh,
    BoxHelper,
    PerspectiveCamera
} from 'three';

import Initializer from "./Initializer";
import {PlayerComponent, PlayerSelectionComponent} from "../components";
import {ComponentId} from "../../../shared/constants";
import AnimatedMesh from "../AnimatedMesh";
import EntityManager from "../../../shared/EntityManager";

export default class PlayerInitializer extends Initializer {
    private camera: PerspectiveCamera;
    private mesh: AnimatedMesh;

    constructor(em: EntityManager, camera: PerspectiveCamera, playerMesh: AnimatedMesh) {
        super(em);
        this.camera = camera;
        this.mesh = playerMesh
    }

    initialize(entity: string, components: Object) {
        Object.keys(components).forEach((componentTypeStr) => {
            let componentType = parseInt(componentTypeStr) as ComponentId;
            let componentData = components[componentType];
            this.entityManager.addComponentFromObject(entity, componentType, componentData);
        });

        // Only current player needs a camera attached.
        let playerMesh;
        if (ComponentId.CurrentPlayer in components) {
            playerMesh = new Object3D();
            this.camera.position.y = 2.5;
            playerMesh.add(this.camera);
        } else {
            playerMesh = this.mesh.clone() as AnimatedMesh
        }

        // Debug helper to see how ground detection works.
        playerMesh.add(new ArrowHelper(new Vector3(0, 0, -1), new Vector3(0, 0, 0), 1));

        // Only show selection box for current player.
        if (ComponentId.CurrentPlayer in components) {
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
            this.entityManager.addComponent(entity, selectionComponent);
        }

        let playerComponent = new PlayerComponent();
        playerComponent.mesh = playerMesh;
        this.entityManager.addComponent(entity, playerComponent);
    }
}