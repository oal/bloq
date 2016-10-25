import {System} from "../../../shared/System";
import {ComponentId} from "../../../shared/constants";
import AssetManager from "../../lib/AssetManager";
import EntityManager from "../../../shared/EntityManager";
import {
    PhysicsComponent, OnGroundComponent, InputComponent, InventoryComponent,
    BlockComponent
} from "../../../shared/components";


class Sound {
    ctx: AudioContext;
    buffer: AudioBuffer;
    source: AudioBufferSourceNode;

    constructor(ctx: AudioContext, buffer: AudioBuffer) {
        this.ctx = ctx;
        this.buffer = buffer;
    }

    play() {
        if (this.source) return;

        let source = this.ctx.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.ctx.destination);
        source.onended = () => {
            this.source = null;
        };
        source.start();
        this.source = source;
    }

    stop() {
        if (this.source) {
            this.source.stop();
            this.source = null;
        }
    }
}


export default class SoundSystem extends System {
    walkSound: Sound;
    digSound: Sound;
    pickupSound: Sound;

    constructor(em: EntityManager, am: AssetManager) {
        super(em);

        let audioContext = new AudioContext();
        this.walkSound = new Sound(audioContext, am.getSound('walk'));
        this.digSound = new Sound(audioContext, am.getSound('dig'));
        this.pickupSound = new Sound(audioContext, am.getSound('pickup'));
    }

    update(dt: number): void {
        this.entityManager.getEntities(ComponentId.Player).forEach((component, entity) => {
            let physComponent = this.entityManager.getComponent<PhysicsComponent>(entity, ComponentId.Physics);
            if (!physComponent) return;

            // Walk
            let groundComponent = this.entityManager.getComponent<OnGroundComponent>(entity, ComponentId.OnGround);
            if (groundComponent && physComponent.isMovingHorizontally()) {
                this.walkSound.play();
            }

            // Dig
            let inputComponent = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);
            if (inputComponent.primaryAction) {
                this.digSound.play();
            }
            /*
             else {
             this.digSound.stop(); // TODO: Enable if digging animation / delay is added
             }
             */

            // Pick up
            let inventoryComponent = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);
            inventoryComponent.slots.forEach((blockEntity) => {
                let block = this.entityManager.getComponent<BlockComponent>(blockEntity, ComponentId.Block);
                if (block && block.isDirty()) this.pickupSound.play();
            });
        });
    }
}
