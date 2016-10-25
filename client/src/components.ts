import {Mesh} from 'three';

import {Component} from '../../shared/components';
import EntityManager from "../../shared/EntityManager";
import {ComponentId, Side} from "../../shared/constants";
import AnimatedMesh from "../lib/AnimatedMesh";

export class MeshComponent extends Component {
    static ID = ComponentId.Mesh;

    mesh: Mesh = null;

    dispose(entityManager: EntityManager): void {
        if (this.mesh && this.mesh.parent) {
            this.mesh.geometry.dispose();
            this.mesh.parent.remove(this.mesh);
        }
    }
}

export class AnimatedMeshComponent extends MeshComponent {
    static ID = ComponentId.AnimatedMesh;

    mesh: AnimatedMesh = null;
}

export class PlayerSelectionComponent extends MeshComponent {
    static ID = ComponentId.PlayerSelection;

    target: [number, number, number] = [0, 0, 0];
    targetSide: Side;
    targetValid: boolean = false;
}


export class PlayerChunkComponent extends Component {
    static ID = ComponentId.PlayerChunk;

    x: number = 0;
    y: number = 0;
    z: number = 0;
}

export function registerClientComponents(manager: EntityManager) {
    manager.registerComponentType(new MeshComponent());
    manager.registerComponentType(new AnimatedMeshComponent());
    manager.registerComponentType(new PlayerSelectionComponent());
    manager.registerComponentType(new PlayerChunkComponent());
}
