import {System} from "../../../shared/System";
import {ComponentId} from "../../../shared/constants";
import AssetManager from "../../lib/AssetManager";
import EntityManager from "../../../shared/EntityManager";
import {PhysicsComponent, OnGroundComponent} from "../../../shared/components";


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
}


export default class SoundSystem extends System {
    walkSound: Sound;

    constructor(em: EntityManager, am: AssetManager) {
        super(em);

        let audioContext = new AudioContext();
        this.walkSound = new Sound(audioContext, am.getSound('walk'));
    }

    update(dt: number): void {
        this.entityManager.getEntities(ComponentId.Player).forEach((component, entity) => {
            let physComponent = this.entityManager.getComponent<PhysicsComponent>(entity, ComponentId.Physics);
            if (!physComponent) return;

            let groundComponent = this.entityManager.getComponent<OnGroundComponent>(entity, ComponentId.OnGround);

            if (groundComponent && physComponent.isMovingHorizontally()) {
                this.walkSound.play();
            }
        });
    }
}