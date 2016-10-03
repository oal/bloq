import {Scene, ShaderMaterial, Mesh, Vector3} from 'three';

import {System} from "../../../shared/systems";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, TERRAIN_CHUNK_SIZE} from "../../../shared/constants";
import {TerrainChunkComponent, PositionComponent} from "../../../shared/components";
import {chunkKey} from "../../../shared/helpers";
import {buildChunkGeometry} from "../geometry/terrain";
import {MeshComponent} from "../components";
import {ServerEvent, Server} from "../Server";


export default class TerrainChunkSystem extends System {
    scene: Scene;
    material: ShaderMaterial;

    initQueue = [];
    renderQueue = []; // Pseudo queue. Gets reordered.

    constructor(em: EntityManager, server: Server,  scene: Scene, material: ShaderMaterial) {
        super(em);
        this.scene = scene;
        this.material = material;

        server.addEventListener(ServerEvent.Terrain, this.onTerrain.bind(this));
    }

    onTerrain(terrainObj: Object) {
        this.initQueue.push(terrainObj);
    }

    update(dt: number) {
        this.initQueue.forEach(terrainObj => {
            let [entity, component] = [terrainObj['entity'], terrainObj['component']];
            let chunkComponent = this.entityManager.addComponent(entity, component) as TerrainChunkComponent;
            chunkComponent.dirtyFields['data'] = true;
        });
        this.initQueue = [];

        // Add dirty chunks to System queue.
        let preLength = this.renderQueue.length;
        this.entityManager.getEntities(ComponentId.TerrainChunk).forEach((component, entity) => {
            let chunkComponent = component as TerrainChunkComponent;
            if (chunkComponent.isDirty()) {
                this.renderQueue.push([chunkComponent.x, chunkComponent.y, chunkComponent.z]);
            }
        });

        // If any chunks were added to dirty queue, sort by distance from player, so closest
        // chunks render first.
        if(this.renderQueue.length > preLength) {
            // Get current player (First key of iterator. There will always only be one CurrentPlayer)
            let playerEntity = this.entityManager.getEntities(ComponentId.CurrentPlayer).keys().next().value;
            let positionComponent = this.entityManager.getComponent<PositionComponent>(playerEntity, ComponentId.Position);
            let [cx, cy, cz] = positionComponent.toChunk();
            let vec = new Vector3(cx, cy, cz);
            this.renderQueue.sort((a, b) => vec.distanceTo(new Vector3(b[0], b[1], b[2])));
        }

        // Shift off queue until we have used 8 ms (half of available frame time) or no chunks are left in queue.
        let cumTime = 0.0;
        let startTime = performance.now();
        while (cumTime < 8 && this.renderQueue.length > 0) {
            let [cx, cy, cz] = this.renderQueue.pop();
            let entity = chunkKey(cx, cy, cz);
            console.time(`create-${entity}`);
            let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(entity, ComponentId.TerrainChunk);

            // If chunk was removed after it was queued.
            if(!chunkComponent) continue;

            // Get all neighbors' chunk data.
            let neighborData = [-1, 0, 1].map(z => {
                return [-1, 0, 1].map(y => {
                    return [-1, 0, 1].map(x => {
                        if(x === 0 && y === 0 && z === 0) return null;

                        let entity = chunkKey(cx+x, cy+y, cz+z);
                        let chunk = this.entityManager.getComponent<TerrainChunkComponent>(entity, ComponentId.TerrainChunk);
                        if(chunk) return chunk.data;
                        else return null;
                    })
                })
            });

            //console.log('Build chunk', entity);
            console.time(`build-${entity}`);
            let chunkGeom = buildChunkGeometry(chunkComponent.data, neighborData);
            console.timeEnd(`build-${entity}`);
            if (!chunkGeom) return;

            let meshComponent = this.entityManager.getComponent<MeshComponent>(entity, ComponentId.Mesh);
            if(!meshComponent) meshComponent = this.entityManager.addComponent(entity, new MeshComponent()) as MeshComponent;
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

            console.timeEnd(`create-${entity}`);

            let endTime = performance.now();
            cumTime += (endTime - startTime);
            startTime = endTime;
        }
    }
}

