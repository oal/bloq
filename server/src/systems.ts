import {PositionComponent, YawComponent} from "../../shared/components"
import EntityManager from "../../shared/EntityManager";
import {NetworkComponent} from "./components";


export function updatePlayerInput(em: EntityManager, playerEntity, obj) {
    let input = obj.components['input'];
    let existingInput = em.getComponent(playerEntity, 'input');
    existingInput.update(input);

    let position = obj.components['position'];
    let existingPosition = em.getComponent(playerEntity, 'position') as PositionComponent;
    let dist = Math.sqrt(Math.pow(position.x - existingPosition.x, 2) + Math.pow(position.y - existingPosition.y, 2) + Math.pow(position.z - existingPosition.z, 2));

    existingPosition.update(position);
    if (dist > 0.5) {
        // TODO: Send correction to client.
        console.log('Too big difference between client and server!', dist);
    }
}

export function updatePlayerYaw(em: EntityManager, playerEntity, obj) {
    let yaw = obj.components['yaw'];
    let existingYaw = em.getComponent(playerEntity, 'yaw') as YawComponent;
    existingYaw.update(yaw);
}

export function informNewPlayers(em: EntityManager) {
    // Will ~99.999% only ever be one new player per tick.
    em.getEntities('newplayer').forEach((component, newEntity) => {
        let newPlayerData = em.serializeEntity(newEntity);

        let ws = em.getComponent(newEntity, 'network') as NetworkComponent;
        ws.websocket.send(newPlayerData);

        // Send info about all new players to existing players.
        em.getEntities('player').forEach((component, existingEntity) => {
            if(existingEntity == newEntity) return; // Never send info about the new player to themselves.
            let ws = em.getComponent(existingEntity, 'network') as NetworkComponent;
            ws.websocket.send(newPlayerData);
        });

        console.log('New player informed.');
        em.removeComponent(newEntity, component);
    });
}