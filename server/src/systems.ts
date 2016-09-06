import EntityManager from "../../shared/EntityManager";
import {NetworkComponent} from "./components";
import {InputComponent, RotationComponent} from "../../shared/components";
import {System} from "../../shared/systems";


export class InformNewPlayersSystem extends System {
    update(dt: number) {
        // Will ~99.999% only ever be one new player per tick.
        let syncComponents = ['position', 'rotation', 'physics', 'input', 'player'];

        this.entityManager.getEntities('newplayer').forEach((component, newEntity) => {
            let newPlayerData = this.entityManager.serializeEntity(newEntity, syncComponents);
            let existingPlayerDatas = [];

            // Send info about new player to existing players.
            this.entityManager.getEntities('player').forEach((component, existingEntity) => {
                if (existingEntity == newEntity) return; // Never send info about the new player to themselves.
                let ws = this.entityManager.getComponent(existingEntity, 'network') as NetworkComponent;
                ws.websocket.send(newPlayerData);

                existingPlayerDatas.push(this.entityManager.serializeEntity(existingEntity, syncComponents));
            });

            // Inform new player about existing players.
            let ws = this.entityManager.getComponent(newEntity, 'network') as NetworkComponent;
            existingPlayerDatas.forEach(data => ws.websocket.send(data));

            console.log('New player informed.');
            this.entityManager.removeComponent(newEntity, component);
        });
    }
}

export class BroadcastPlayerInputSystem extends System {
    update(dt: number) {
        let changedInputs = new Map();
        this.entityManager.getEntities('input').forEach((component, entity) => {
            let inputComponent = component as InputComponent;
            if (inputComponent.isDirty()) {
                changedInputs.set(entity, inputComponent.serialize());
                inputComponent.setDirty(false);
            }
        });

        let changedRots = new Map();
        this.entityManager.getEntities('rotation').forEach((component, entity) => {
            let rot = component as RotationComponent;
            if (rot.isDirty()) {
                changedRots.set(entity, rot.serialize());
                rot.setDirty(false);
            }
        });

        if (changedInputs.size > 0) {
            this.entityManager.getEntities('network').forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedInputs.forEach((serializedInputs, changedEntity) => {
                    if (changedEntity === entity) return;
                    netComponent.websocket.send(`{"entity":"${changedEntity}","components":{"input":${serializedInputs}}}`)
                });
            })
        }

        if (changedRots.size > 0) {
            this.entityManager.getEntities('network').forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedRots.forEach((serializedYaw, changedEntity) => {
                    if (changedEntity === entity) return;
                    netComponent.websocket.send(`{"entity":"${changedEntity}","components":{"yaw":${serializedYaw}}}`)
                })
            })
        }
    }
}

export class RemoveEntitySystem extends System {
    update(dt: number) {
        this.entityManager.getEntities('removedentity').forEach((component, entity) => {
            let data = this.entityManager.serializeEntity(entity, ['removedentity']);
            console.log(data)
            this.entityManager.removeEntity(entity);
            this.entityManager.getEntities('player').forEach((component, entity) => {
                let netComponent = this.entityManager.getComponent(entity, 'network') as NetworkComponent;
                netComponent.websocket.send(data);
            });
        })
    }
}