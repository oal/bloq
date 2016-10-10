import {System} from "../../../shared/System";
import {Server} from "../Server";
import EntityManager from "../../../shared/EntityManager";
import {ComponentId} from "../../../shared/constants";
import {RotationComponent, PositionComponent, InputComponent, InventoryComponent} from "../../../shared/components";


export default class PlayerInputSyncSystem extends System {
    server: Server;

    constructor(em: EntityManager, server: Server) {
        super(em);
        this.server = server;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.CurrentPlayer).forEach((component, entity) => {
            let position = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            let input = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);

            if (input.isDirty()) {
                let components = {};
                components[ComponentId.Position] = position;
                components[ComponentId.Input] = input;
                this.server.sendEntity({
                    entity: entity,
                    components: components
                });
            }

            let rot = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
            if (rot.isDirty()) {
                let components = {};
                components[ComponentId.Rotation] = rot;
                this.server.sendEntity({
                    entity: entity,
                    components: components
                });
            }

            let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);
            if (inventory.isDirty()) {
                console.log('send inventory');
                let components = {};
                components[ComponentId.Inventory] = inventory;
                this.server.sendEntity({
                    entity: entity,
                    components: components
                });
            }
        })
    }
}