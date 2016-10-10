import {System} from "../../../shared/System";
import {Server} from "../Server";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId} from "../../../shared/constants";
import {RotationComponent, PositionComponent, InputComponent, InventoryComponent} from "../../../shared/components";
import NetworkSystem from "./NetworkSystem";


export default class PlayerInputSyncSystem extends System {
    netSystem: NetworkSystem;
    server: Server;

    constructor(em: EntityManager, netSystem: NetworkSystem, server: Server) {
        super(em);
        this.netSystem = netSystem;
        this.server = server;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.CurrentPlayer).forEach((component, entity) => {
            let input = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);

            if (input.isDirty()) {
                this.netSystem.pushBuffer(this.entityManager.serializeEntity(entity, [
                    ComponentId.Position,
                    ComponentId.Input
                ]))
            }

            let rot = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
            if (rot.isDirty()) {
                this.netSystem.pushBuffer(this.entityManager.serializeEntity(entity, [
                    ComponentId.Rotation
                ]))
            }

            let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);
            if (inventory.isDirty()) {
                this.netSystem.pushBuffer(this.entityManager.serializeEntity(entity, [
                    ComponentId.Inventory
                ]))
            }
        })
    }
}