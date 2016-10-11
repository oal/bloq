import {System} from "../../../shared/System";
import {ComponentId, MessageType} from "../../../shared/constants";
import {NetworkComponent} from "../components";


export default class InformNewPlayersSystem extends System {
    update(dt: number) {
        // Will ~99.999% only ever be one new player per tick.
        let syncComponents = [
            ComponentId.Position,
            ComponentId.Rotation,
            ComponentId.Physics,
            ComponentId.Input,
            ComponentId.Player,
            ComponentId.WallCollision
        ];

        this.entityManager.getEntities(ComponentId.NewPlayer).forEach((component, newEntity) => {
            let newPlayerData = this.entityManager.serializeEntity(newEntity, syncComponents);
            console.log(newPlayerData);
            let existingPlayerDatas = [];

            // Send info about new player to existing players.
            this.entityManager.getEntities(ComponentId.Player).forEach((component, existingEntity) => {
                if (existingEntity == newEntity) return; // Never send info about the new player to themselves.
                let netComponent = this.entityManager.getComponent<NetworkComponent>(existingEntity, ComponentId.Network);
                netComponent.pushBuffer(MessageType.Entity, newPlayerData);

                existingPlayerDatas.push(this.entityManager.serializeEntity(existingEntity, syncComponents));
            });

            // Inform new player about existing players.
            let netComponent = this.entityManager.getComponent<NetworkComponent>(newEntity, ComponentId.Network);
            existingPlayerDatas.forEach(data => {
                netComponent.pushBuffer(MessageType.Entity, data);
            });

            this.entityManager.getEntities(ComponentId.Pickable).forEach((component, pickableEntity) => {
                netComponent.pushBuffer(MessageType.Entity, this.entityManager.serializeEntity(pickableEntity));
            });

            console.log('New player informed.');
            this.entityManager.removeComponent(newEntity, component);
        });
    }
}