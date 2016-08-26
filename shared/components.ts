export class Component {
    typeName(): string {
        let fullName = this.constructor.name.toString().toLowerCase();
        return fullName.substring(0, fullName.length-9); // Everything except "Component".
    }

    serialize() {
        return JSON.stringify(this);
    }

    dispose(): void {}
}

export class PositionComponent extends Component {
    x: number = 0;
    y: number = 0;
    z: number = 0;
}

export class PhysicsComponent extends Component {}
