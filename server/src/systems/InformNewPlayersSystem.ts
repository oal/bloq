import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {NetworkComponent} from "../components";
import Server from "../Server";


export default class InformNewPlayersSystem extends System {
    update(dt: number) {
        // Will ~99.999% only ever be one new player per tick.
        let syncComponents = [
            ComponentId.Position,
            ComponentId.Rotation,
            ComponentId.Physics,
            ComponentId.Input,
            ComponentId.Player
        ];

        this.entityManager.getEntities(ComponentId.NewPlayer).forEach((component, newEntity) => {
            let newPlayerData = this.entityManager.serializeEntity(newEntity, syncComponents);
            let existingPlayerDatas = [];

            // Send info about new player to existing players.
            this.entityManager.getEntities(ComponentId.Player).forEach((component, existingEntity) => {
                if (existingEntity == newEntity) return; // Never send info about the new player to themselves.
                let ws = this.entityManager.getComponent(existingEntity, ComponentId.Network) as NetworkComponent;
                Server.sendEntity(ws.websocket, newPlayerData);

                existingPlayerDatas.push(this.entityManager.serializeEntity(existingEntity, syncComponents));
            });

            // Inform new player about existing players.
            let ws = this.entityManager.getComponent(newEntity, ComponentId.Network) as NetworkComponent;
            existingPlayerDatas.forEach(data => {
                Server.sendEntity(ws.websocket, data);
            });

            console.log('New player informed.');
            this.entityManager.removeComponent(newEntity, component);
        });
    }
}