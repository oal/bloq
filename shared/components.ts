export class Component {
    typeName(): string {
        return this.constructor.toString();
    }
}

class Position extends Component {
    x: number;
    y: number;
    z: number;
}

class Physics extends Component {}
