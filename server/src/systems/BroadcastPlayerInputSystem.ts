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
                changedInputs.set(entity, this.entityManager.serializeEntity(entity, [ComponentId.Input, ComponentId.Position]));
            }
        });

        let changedRots = new Map();
        this.entityManager.getEntities(ComponentId.Rotation).forEach((component, entity) => {
            let rot = component as RotationComponent;
            if (rot.isDirty()) {
                changedRots.set(entity, this.entityManager.serializeEntity(entity, [ComponentId.Rotation]));
            }
        });

        if (changedInputs.size > 0) {
            this.entityManager.getEntities(ComponentId.Network).forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedInputs.forEach((serializedComponents, changedEntity) => {
                    if (changedEntity === entity) return;
                    Server.sendEntity(netComponent.websocket, serializedComponents);
                });
            })
        }

        if (changedRots.size > 0) {
            this.entityManager.getEntities(ComponentId.Network).forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedRots.forEach((serializedRot, changedEntity) => {
                    if (changedEntity === entity) return;
                    Server.sendEntity(netComponent.websocket, serializedRot)
                })
            })
        }
    }
}