import {Mesh} from 'three';

import {Component} from '../../shared/components';

export class MeshComponent extends Component {
    mesh: Mesh;

    dispose(): void {
        super.dispose();
        if(this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
    }
}