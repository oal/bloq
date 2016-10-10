import {System} from "../../../shared/System";
import EntityManager from "../../../shared/EntityManager";
import {EntityManagerEvent} from "../../../shared/EntityManager";
import {ComponentId, ActionId} from "../../../shared/constants";
import {PositionComponent} from "../../../shared/components";
import {broadcastEntity, broadcastAction} from "../helpers";
import {RemoveEntitiesAction} from "../../../shared/actions";


export default class BroadcastEntitySystem extends System {
    addedEntities: Array<string> = [];
    removedEntities: Array<string> = [];

    constructor(em: EntityManager) {
        super(em);

        this.entityManager.addEventListener(EntityManagerEvent.EntityCreated, this.onEntityCreated.bind(this));
        this.entityManager.addEventListener(EntityManagerEvent.EntityRemoved, this.onEntityRemoved.bind(this));
    }

    onEntityCreated(entity: string) {
        this.addedEntities.push(entity);
    }

    onEntityRemoved(entity: string, chunk: [number, number, number]) {
        this.removedEntities.push(entity);
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

        this.removedEntities.forEach(entity => {
            let posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            if(!posComponent) return;

            broadcastAction(
                this.entityManager,
                posComponent.toChunk(),
                ActionId.RemoveEntities,
                new RemoveEntitiesAction([entity])
            );
        });

        // Reset entity list for next tick.
        this.addedEntities = [];
        this.removedEntities = [];
    }
}