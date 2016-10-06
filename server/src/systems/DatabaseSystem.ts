import {Database} from 'sqlite3';
import {System} from "../../../shared/systems";
import EntityManager from "../../../shared/EntityManager";
import {EntityManagerEvent} from "../../../shared/EntityManager";
import {ComponentId} from "../../../shared/constants";
import {deserializeTerrainChunk} from "../../../client/src/Server";


export default class DatabaseSystem extends System {
    private db: Database = new Database('db.sqlite');
    private addedComponents: Array<Array> = [];
    private replacedComponents: Array<Array> = [];
    private removedComponents: Array<Array> = [];

    constructor(em: EntityManager) {
        super(em);
        this.initDatabase();
    }

    initDatabase() {
        this.db.run(`
        CREATE TABLE IF NOT EXISTS components (
            type INTEGER NOT NULL,
            entity STRING NOT NULL,
            data BLOB,
            PRIMARY KEY (type, entity)
        );`);
    }

    restore(complete: Function) {
        this.db.each(`SELECT type, entity, data FROM components`, (err, row) => {
            if(typeof row.data === 'string') {
                this.entityManager.addComponentFromObject(row.entity, row.type, JSON.parse(row.data));
            } else {
                // Chunk
                let [_, chunkComponent] = deserializeTerrainChunk(row.data.buffer);
                this.entityManager.addComponent(row.entity, chunkComponent);
            }

        }, complete);
    }

    update(dt: number) {
        //this.db.exec(`BEGIN`);

        this.addedComponents.forEach(arr => {
            if(this.entityManager.getComponent(arr[0], ComponentId.Player)) return;
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

    private onComponentAdded(entity: string, componentId: ComponentId) {
        this.addedComponents.push([entity, componentId]);
    }

    private onComponentReplaced(entity: string, componentId: ComponentId) {
        this.replacedComponents.push([entity, componentId]);
    }

    private onComponentRemoved(entity: string, componentId: ComponentId) {
        this.removedComponents.push([entity, componentId]);
    }
}