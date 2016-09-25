import {System} from "../../../shared/systems";
import EntityManager from "../../../shared/EntityManager";
import {EntityManagerEvent} from "../../../shared/EntityManager";
import {ComponentId, ActionId} from "../../../shared/constants";
import {PositionComponent} from "../../../shared/components";
import {broadcastEntity, broadcastAction} from "../helpers";
import {RemoveEntitiesAction} from "../../../shared/actions";


export default class BroadcastEntitySystem extends System {
    addedEntities: Array<string> = [];
    removedEntities: Array<[string, number, number, number]> = [];

    constructor(em: EntityManager) {
        super(em);

        this.entityManager.addEventListener(EntityManagerEvent.EntityCreated, this.onEntityCreated.bind(this));
        this.entityManager.addEventListener(EntityManagerEvent.EntityRemoved, this.onEntityRemoved.bind(this));
    }

    onEntityCreated(entity: string) {
        this.addedEntities.push(entity);
    }

    onEntityRemoved(entity: string, chunk: [number, number, number]) {
        this.removedEntities.push([entity, chunk[0], chunk[1], chunk[2]]);
    }

    update(dt: number): any {
        // Process added entities
        this.addedEntities.forEach(entity => {
            // Blocks that have been digged, and appeared as pickable entities.
            if (this.entityManager.hasComponent(entity, ComponentId.Block)) {
                let posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
                broadcastEntity(this.entityManager, posComponent.toChunk(), entity);
            }
        });

        this.removedEntities.forEach(data => {
            let [entity, cx, cy, cz] = data;
            broadcastAction(this.entityManager, [cx, cy, cz], ActionId.RemoveEntities, new RemoveEntitiesAction([entity]));
        });

        // Reset entity list for next tick.
        this.addedEntities = [];
        this.removedEntities = [];
    }
}