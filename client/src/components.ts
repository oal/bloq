import {Mesh} from 'three';

import {Component} from '../../shared/components';
import EntityManager from "../../shared/EntityManager";
import {ComponentId, Side} from "../../shared/constants";
import AnimatedMesh from "./AnimatedMesh";

export class MeshComponent extends Component {
    static ID = ComponentId.Mesh;

    mesh: Mesh = null;

    dispose(): void {
        super.dispose();
        if(this.mesh && this.mesh.parent) {
            //console.log('Disposing mesh.');
            this.mesh.geometry.dispose();
            this.mesh.parent.remove(this.mesh);
        }
    }
}

export class PlayerSelectionComponent extends MeshComponent {
    static ID = ComponentId.PlayerSelection;

    target: [number, number, number] = [0, 0, 0];
    targetSide: Side;
    targetValid: boolean = false;
}


// Similar, but simpler component is found on server. Server version doesn't need to be concerned with meshes etc.
export class PlayerComponent extends MeshComponent {
    static ID = ComponentId.Player;

    mesh: AnimatedMesh;
}

export function registerClientComponents(manager: EntityManager) {
    manager.registerComponentType(new MeshComponent());
    manager.registerComponentType(new PlayerComponent());
    manager.registerComponentType(new PlayerSelectionComponent());
}

