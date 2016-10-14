import {
    BoxBufferGeometry,
    Object3D,
    Mesh,
    PerspectiveCamera,
    ShaderMaterial
} from 'three';

import Initializer from "../../../shared/Initializer";
import {PlayerComponent, PlayerSelectionComponent} from "../components";
import {ComponentId} from "../../../shared/constants";
import AnimatedMesh from "../AnimatedMesh";
import EntityManager from "../../../shared/EntityManager";

export default class PlayerInitializer extends Initializer {
    private camera: PerspectiveCamera;
    private mesh: AnimatedMesh;
    private selectionMaterial: ShaderMaterial;

    constructor(em: EntityManager, camera: PerspectiveCamera, playerMesh: AnimatedMesh, selectionMaterial: ShaderMaterial) {
        super(em);
        this.camera = camera;
        this.mesh = playerMesh;
        this.selectionMaterial = selectionMaterial;
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

        // Only show selection box for current player.
        if (ComponentId.CurrentPlayer in components) {
            console.log('Spawning current player');
            let selectionComponent = new PlayerSelectionComponent();

            // Need an underlying box for the Box helper to work.
            // Could also render this BoxGeometry in wireframe mode, but then we get diagonal lines,
            // as it renders triangles.
            let selectionGeom = new BoxBufferGeometry(1.0, 1.0, 1.0);

            // Update and add component.
            selectionComponent.mesh = new Mesh(selectionGeom, this.selectionMaterial);
            this.entityManager.addComponent(entity, selectionComponent);
        }

        let playerComponent = new PlayerComponent();
        playerComponent.mesh = playerMesh;
        this.entityManager.addComponent(entity, playerComponent);
    }
}