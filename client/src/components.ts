import {Mesh} from 'three';

import {Component} from '../../shared/components';
import EntityManager from "../../shared/EntityManager";

export class MeshComponent extends Component {
    mesh: Mesh;

    dispose(): void {
        super.dispose();
        if(this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
    }
}

export function registerClientComponents(manager: EntityManager) {
    manager.registerComponentType(new MeshComponent());
}