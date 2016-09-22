import EntityManager from "./EntityManager";
import {
    PositionComponent, InputComponent, PhysicsComponent, WallCollisionComponent,
    RotationComponent, OnGroundComponent, TerrainChunkComponent
} from "./components";
import {chunkKey, globalToChunk, mod} from "./helpers";
import {TERRAIN_CHUNK_SIZE, ComponentId} from "./constants";
import {ActionManager} from "./actions";

// Base system which all other systems inherit from.
export class System {
    entityManager: EntityManager;

    constructor(em: EntityManager) {
        this.entityManager = em;
    }

    update(dt: number) {
        console.warn('Please override update.')
    }
}
