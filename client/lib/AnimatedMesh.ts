import {SkinnedMesh, Geometry, MeshBasicMaterial, AnimationMixer} from 'three';

export default class AnimatedMesh extends SkinnedMesh {
    mixer: AnimationMixer;
    private animations: {} = {};
    private animation: string;

    constructor(geometry: Geometry, material: MeshBasicMaterial) {
        super(geometry, material);

        this.mixer = new AnimationMixer(this);

        (this.geometry as Geometry).animations.forEach(anim => {
            this.animations[anim.name] = anim;
        });

        this.playAnimation('walk');
    }

    playAnimation(name: string) {
        this.mixer.stopAllAction(this.animations[this.animation]);
        let anim = this.animations[name];
        if (anim) {
            let action = this.mixer.clipAction(anim, this);
            action.play();
            this.animation = name;
        } else {
            console.warn(`Animation ${name} does not exist.`);
        }
    }

    getCurrentAnimation():string {
        return this.animation;
    }


}