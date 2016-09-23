import {Scene, ShaderMaterial, Mesh, Vector3} from 'three';

import {System} from "../../../shared/systems";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, TERRAIN_CHUNK_SIZE} from "../../../shared/constants";
import {TerrainChunkComponent, PositionComponent} from "../../../shared/components";
import {chunkKey} from "../../../shared/helpers";
import {buildChunkGeometry} from "../terrain";
import {MeshComponent} from "../components";


export default class TerrainChunkSystem extends System {
    scene: Scene;
    material: ShaderMaterial;

    queue = []; // Pseudo queue. Gets reordered.

    constructor(em: EntityManager, scene: Scene, material: ShaderMaterial) {
        super(em);
        this.scene = scene;
        this.material = material;
    }

    update(dt: number) {
        // Add dirty chunks to System queue.
        let preLength = this.queue.length;
        this.entityManager.getEntities(ComponentId.TerrainChunk).forEach((component, entity) => {
            let chunkComponent = component as TerrainChunkComponent;
            if (chunkComponent.isDirty()) {
                this.queue.push([chunkComponent.x, chunkComponent.y, chunkComponent.z]);
            }
        });

        // If any chunks were added to dirty queue, sort by distance from player, so closest
        // chunks render first.
        if(this.queue.length > preLength) {
            // Get current player (First key of iterator. There will always only be one CurrentPlayer)
            let playerEntity = this.entityManager.getEntities(ComponentId.CurrentPlayer).keys().next().value;
            let positionComponent = this.entityManager.getComponent(playerEntity, ComponentId.Position) as PositionComponent;
            let [cx, cy, cz] = positionComponent.toChunk();
            let vec = new Vector3(cx, cy, cz);
            this.queue.sort((a, b) => vec.distanceTo(new Vector3(b[0], b[1], b[2])));
        }

        // Shift off queue until we have used 8 ms (half of available frame time) or no chunks are left in queue.
        let cumTime = 0.0;
        let startTime = performance.now();
        while (cumTime < 8 && this.queue.length > 0) {
            let [cx, cy, cz] = this.queue.pop();
            let entity = chunkKey(cx, cy, cz);
            let chunkComponent = this.entityManager.getComponent(entity, ComponentId.TerrainChunk) as TerrainChunkComponent;

            // If chunk was removed after it was queued.
            if(!chunkComponent) continue;

            // Get all neighbors' chunk data.
            let neighborData = [-1, 0, 1].map(z => {
                return [-1, 0, 1].map(y => {
                    return [-1, 0, 1].map(x => {
                        if(x === 0 && y === 0 && z === 0) return null;

                        let entity = chunkKey(cx+x, cy+y, cz+z);
                        let chunk = this.entityManager.getComponent(entity, ComponentId.TerrainChunk) as TerrainChunkComponent;
                        if(chunk) return chunk.data;
                        else return null;
                    })
                })
            });

            console.log('Build chunk', entity);
            let chunkGeom = buildChunkGeometry(chunkComponent.data, neighborData);
            if (!chunkGeom) return;

            let meshComponent = (this.entityManager.getComponent(entity, ComponentId.Mesh) || this.entityManager.addComponent(entity, new MeshComponent())) as MeshComponent;
            let mesh = meshComponent.mesh;
            if (meshComponent.mesh) {
                mesh.geometry.dispose();
                mesh.geometry = chunkGeom;
            }
            else mesh = new Mesh(chunkGeom, this.material);

            if (!meshComponent.mesh) {
                meshComponent.mesh = mesh;
                this.scene.add(mesh);
            }

            // Set chunk position. Add offsets so displayed mesh corresponds with collision detection and
            // lookups on the underlying data for the terrain chunk.
            mesh.position.x = chunkComponent.x * TERRAIN_CHUNK_SIZE;
            mesh.position.y = chunkComponent.y * TERRAIN_CHUNK_SIZE;
            mesh.position.z = chunkComponent.z * TERRAIN_CHUNK_SIZE;

            let endTime = performance.now();
            cumTime += (endTime - startTime);
            startTime = endTime;
        }
    }
}

