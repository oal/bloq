import {System} from "../../../shared/systems";
import {ComponentId} from "../../../shared/constants";
import {InputComponent, RotationComponent} from "../../../shared/components";
import {NetworkComponent} from "../components";
import Server from "../Server";


export default class BroadcastPlayerInputSystem extends System {
    update(dt: number) {
        let changedInputs = new Map();
        this.entityManager.getEntities(ComponentId.Input).forEach((component, entity) => {
            let inputComponent = component as InputComponent;
            if (inputComponent.isDirty()) {
                changedInputs.set(entity, inputComponent.serialize());
            }
        });

        let changedRots = new Map();
        this.entityManager.getEntities(ComponentId.Rotation).forEach((component, entity) => {
            let rot = component as RotationComponent;
            if (rot.isDirty()) {
                changedRots.set(entity, rot.serialize());
            }
        });

        if (changedInputs.size > 0) {
            this.entityManager.getEntities(ComponentId.Network).forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedInputs.forEach((serializedInputs, changedEntity) => {
                    if (changedEntity === entity) return;
                    Server.sendEntity(netComponent.websocket, `{"entity":"${changedEntity}","components":{"${ComponentId.Input}":${serializedInputs}}}`);
                });
            })
        }

        if (changedRots.size > 0) {
            this.entityManager.getEntities(ComponentId.Network).forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedRots.forEach((serializedRot, changedEntity) => {
                    if (changedEntity === entity) return;
                    Server.sendEntity(netComponent.websocket, `{"entity":"${changedEntity}","components":{"${ComponentId.Rotation}":${serializedRot}}}`)
                })
            })
        }
    }
}