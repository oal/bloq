import {Database} from 'sqlite3';
import {System} from "../../../shared/systems";
import EntityManager from "../../../shared/EntityManager";
import {EntityManagerEvent} from "../../../shared/EntityManager";
import {ComponentId} from "../../../shared/constants";


export default class DatabaseSystem extends System {
    private db: Database = new Database(':memory:'); // WIP, only in memory for now
    private addedComponents: Array<Array> = [];
    private replacedComponents: Array<Array> = [];
    private removedComponents: Array<Array> = [];

    constructor(em: EntityManager) {
        super(em);
        this.initDatabase();
        this.registerEntityEvents();
    }

    initDatabase() {
        this.db.serialize(() => {
            this.db.run(`
            CREATE TABLE components (
                type INTEGER NOT NULL,
                entity STRING NOT NULL,
                data BLOB,
                PRIMARY KEY (type, entity)
            );`);
        });
    }

    update(dt: number) {
        //this.db.exec(`BEGIN`);

        this.addedComponents.forEach(arr => {
            let component = this.entityManager.getComponent(arr[0], arr[1]);
            if(!component || !component.serialize) return;

            this.db.run(`INSERT INTO components (type, entity, data) VALUES (?, ?, ?)`, [arr[1], arr[0], component.serialize()]);
        });
        this.addedComponents = [];

        this.replacedComponents.forEach(arr => {
            let component = this.entityManager.getComponent(arr[0], arr[1]);
            if(!component || !component.serialize) return;
            this.db.run(`UPDATE components SET data = ? WHERE type = ? AND entity = ?`, [component.serialize(), arr[1], arr[0]]);
        });
        this.replacedComponents = [];

        this.removedComponents.forEach(arr => {
            this.db.run(`DELETE FROM components WHERE type = ? AND entity = ?`, [arr[1], arr[0]]);
        });
        this.removedComponents = [];

        //this.db.exec(`COMMIT`);
    }

    // Event listeners on EntityManager
    registerEntityEvents() {
        this.entityManager.addEventListener(EntityManagerEvent.ComponentAdded, this.onComponentAdded.bind(this));
        this.entityManager.addEventListener(EntityManagerEvent.ComponentReplaced, this.onComponentReplaced.bind(this));
        this.entityManager.addEventListener(EntityManagerEvent.ComponentRemoved, this.onComponentRemoved.bind(this));
    }

    onComponentAdded(entity: string, componentId: ComponentId) {
        this.addedComponents.push([entity, componentId]);
    }

    onComponentReplaced(entity: string, componentId: ComponentId) {
        this.replacedComponents.push([entity, componentId]);
    }

    onComponentRemoved(entity: string, componentId: ComponentId) {
        this.removedComponents.push([entity, componentId]);
    }
}