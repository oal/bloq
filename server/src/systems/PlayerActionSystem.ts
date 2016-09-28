import {System} from "../../../shared/systems";
import {ServerActionManager} from "../actions";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId, Side, ActionId, TERRAIN_CHUNK_SIZE} from "../../../shared/constants";
import {
    InputComponent, InventoryComponent, PositionComponent, BlockComponent, TerrainChunkComponent
} from "../../../shared/components";
import {SetBlocksAction} from "../../../shared/actions";
import {globalToChunk, chunkKey, mod} from "../../../shared/helpers";
import {broadcastAction} from "../helpers";
import {PickableComponent} from "../components";


export default class PlayerActionSystem extends System {
    actionManager: ServerActionManager;

    constructor(entityManager: EntityManager, actionManager: ServerActionManager) {
        super(entityManager);
        this.actionManager = actionManager;
    }

    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Input).forEach((component, entity) => {
            let inputComponent = component as InputComponent;

            let modifiedBlocks = [];
            if (inputComponent.isDirty('primaryAction') && inputComponent.primaryAction) {
                let target = inputComponent.target;
                modifiedBlocks.push([target[0], target[1], target[2], 0]);

                // TODO: Move all of this into a "createBlockEntity" function or something similar:
                let key = chunkKey(globalToChunk(target[0]), globalToChunk(target[1]), globalToChunk(target[2]));
                let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);
                let currentKind = chunkComponent.getValue(mod(target[0], TERRAIN_CHUNK_SIZE), mod(target[1], TERRAIN_CHUNK_SIZE), mod(target[2], TERRAIN_CHUNK_SIZE));
                if (currentKind !== 0) {
                    let blockEntity = this.entityManager.createEntity();
                    let pos = new PositionComponent();
                    pos.x = target[0];
                    pos.y = target[1];
                    pos.z = target[2];

                    let block = new BlockComponent();
                    block.kind = currentKind;
                    this.entityManager.addComponent(blockEntity, pos);
                    this.entityManager.addComponent(blockEntity, block);
                    this.entityManager.addComponent(blockEntity, new PickableComponent());
                }
            }

            if (inputComponent.isDirty('secondaryAction') && inputComponent.secondaryAction) {
                let target = inputComponent.target;

                let add = [0, 0, 0];
                switch (inputComponent.targetSide) {
                    case Side.Top:
                        add[1] = 1;
                        break;
                    case Side.North:
                        add[2] = 1;
                        break;
                    case Side.East:
                        add[0] = 1;
                        break;
                    case Side.South:
                        add[2] = -1;
                        break;
                    case Side.West:
                        add[0] = -1;
                        break;
                    case Side.Bottom:
                        add[1] = -1;
                        break;
                }

                // TODO: WIP. Should use entity in current slot instead of index as block type.
                let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);
                modifiedBlocks.push([target[0] + add[0], target[1] + add[1], target[2] + add[2], inventory.activeSlot + 1]);
            }

            // Broadcast so it's queued on clients.
            if (modifiedBlocks.length > 0) {
                let action = new SetBlocksAction(modifiedBlocks);
                let [cx, cy, cz] = inputComponent.target.map(globalToChunk);
                broadcastAction(this.entityManager, [cx, cy, cz], ActionId.SetBlocks, action);
                this.actionManager.queueAction(action); // Queue on server as well.
            }
        });
    }
}