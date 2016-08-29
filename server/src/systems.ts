import EntityManager from "../../shared/EntityManager";
import {NetworkComponent} from "./components";
import {InputComponent, YawComponent} from "../../shared/components";


export function informNewPlayers(em: EntityManager) {
    // Will ~99.999% only ever be one new player per tick.
    em.getEntities('newplayer').forEach((component, newEntity) => {
        let newPlayerData = em.serializeEntity(newEntity, ['position', 'input', 'yaw', 'player']);

        // Send info about all new players to existing players.
        em.getEntities('player').forEach((component, existingEntity) => {
            if (existingEntity == newEntity) return; // Never send info about the new player to themselves.
            let ws = em.getComponent(existingEntity, 'network') as NetworkComponent;
            ws.websocket.send(newPlayerData);
        });

        console.log('New player informed.');
        em.removeComponent(newEntity, component);
    });
}

export function broadcastPlayerInput(em: EntityManager) {
    let changedInputs = new Map();
    em.getEntities('input').forEach((component, entity) => {
        let inputComponent = component as InputComponent;
        if(inputComponent.isDirty()) {
            changedInputs.set(entity, inputComponent.serialize());
        }
    });


    let changedYaws = new Map();
    em.getEntities('yaw').forEach((component, entity) => {
        let yawComponent = component as YawComponent;
        if(yawComponent.isDirty()) {
            changedYaws.set(entity, yawComponent.serialize());
        }
    });

    if(changedInputs.size > 0) {
        em.getEntities('network').forEach((component, entity) => {
            let netComponent = component as NetworkComponent;
            changedInputs.forEach((serializedInputs, changedEntity) => {
                if(changedEntity === entity) return;
                netComponent.websocket.send(`{"entity":"${changedEntity}","components":{"input":${serializedInputs}}}`)
            });

            changedYaws.forEach((serializedYaw, changedEntity) => {
                if(changedEntity === entity) return;
                netComponent.websocket.send(`{"entity":"${changedEntity}","components":{"yaw":${serializedYaw}}}`)
            })
        })
    }
}