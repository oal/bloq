import {Object3D, Mesh} from 'three';

import {Component} from '../../shared/components';
import EntityManager from "../../shared/EntityManager";
import {TERRAIN_CHUNK_SIZE} from "../../shared/constants";

export class MeshComponent extends Component {
    mesh: Object3D;

    dispose(): void {
        super.dispose();
        if(this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
    }
}

// Component should ideally just be data, without methods, but it's just a getter...
export class TerrainChunkComponent extends Component {
    mesh: Mesh;
    data: Uint8Array;

    getValue(x: number, y: number, z: number) {
        if (x < 0 || y < 0 || z < 0 || x >= TERRAIN_CHUNK_SIZE || y >= TERRAIN_CHUNK_SIZE || z >= TERRAIN_CHUNK_SIZE) return 0;
        return this.data[(y|0) * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE + (z|0) * TERRAIN_CHUNK_SIZE + (x|0)];
    }

    dispose(): void {
        super.dispose();
        if(this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
    }
}

export function registerClientComponents(manager: EntityManager) {
    manager.registerComponentType(new MeshComponent());
    manager.registerComponentType(new TerrainChunkComponent());
}