import EntityManager from "../../shared/EntityManager";
import {NetworkComponent} from "./components";
import {InputComponent, RotationComponent} from "../../shared/components";


export function informNewPlayers(em: EntityManager) {
    // Will ~99.999% only ever be one new player per tick.
    let syncComponents = ['position', 'rotation', 'physics', 'input', 'player'];

    em.getEntities('newplayer').forEach((component, newEntity) => {
        let newPlayerData = em.serializeEntity(newEntity, syncComponents);
        let existingPlayerDatas = [];

        // Send info about new player to existing players.
        em.getEntities('player').forEach((component, existingEntity) => {
            if (existingEntity == newEntity) return; // Never send info about the new player to themselves.
            let ws = em.getComponent(existingEntity, 'network') as NetworkComponent;
            ws.websocket.send(newPlayerData);

            existingPlayerDatas.push(em.serializeEntity(existingEntity, syncComponents));
        });

        // Inform new player about existing players.
        let ws = em.getComponent(newEntity, 'network') as NetworkComponent;
        existingPlayerDatas.forEach(data => ws.websocket.send(data));

        console.log('New player informed.');
        em.removeComponent(newEntity, component);
    });
}

export function broadcastPlayerInput(em: EntityManager) {
    let changedInputs = new Map();
    em.getEntities('input').forEach((component, entity) => {
        let inputComponent = component as InputComponent;
        if (inputComponent.isDirty()) {
            changedInputs.set(entity, inputComponent.serialize());
            inputComponent.setDirty(false);
        }
    });

    let changedRots = new Map();
    em.getEntities('rotation').forEach((component, entity) => {
        let rot = component as RotationComponent;
        if (rot.isDirty()) {
            changedRots.set(entity, rot.serialize());
            rot.setDirty(false);
        }
    });

    if (changedInputs.size > 0) {
        em.getEntities('network').forEach((component, entity) => {
            let netComponent = component as NetworkComponent;
            changedInputs.forEach((serializedInputs, changedEntity) => {
                if (changedEntity === entity) return;
                netComponent.websocket.send(`{"entity":"${changedEntity}","components":{"input":${serializedInputs}}}`)
            });
        })
    }

    if (changedRots.size > 0) {
        em.getEntities('network').forEach((component, entity) => {
            let netComponent = component as NetworkComponent;
            changedRots.forEach((serializedYaw, changedEntity) => {
                if (changedEntity === entity) return;
                netComponent.websocket.send(`{"entity":"${changedEntity}","components":{"yaw":${serializedYaw}}}`)
            })
        })
    }
}

export function removeEntities(em: EntityManager) {
    em.getEntities('removedentity').forEach((component, entity) => {
        let data = em.serializeEntity(entity, ['removedentity']);
        console.log(data)
        em.removeEntity(entity);
        em.getEntities('player').forEach((component, entity) => {
            let netComponent = em.getComponent(entity, 'network') as NetworkComponent;
            netComponent.websocket.send(data);
        });
    })
}