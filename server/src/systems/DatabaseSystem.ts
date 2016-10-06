import {Database} from 'sqlite3';
import {System} from "../../../shared/systems";
import EntityManager from "../../../shared/EntityManager";
import {EntityManagerEvent} from "../../../shared/EntityManager";
import {ComponentId} from "../../../shared/constants";
import {TerrainChunkComponent, SerializableComponent} from "../../../shared/components";
import {deserializeTerrainChunk} from "../../../shared/helpers";


export default class DatabaseSystem extends System {
    private db: Database = new Database('db.sqlite');
    private addedComponents: Array<[string, ComponentId]> = [];
    private replacedComponents: Array<[string, ComponentId]> = [];
    private removedComponents: Array<[string, ComponentId]> = [];

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
            if (typeof row.data === 'string') {
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
        let numInserts = 0;
        let numUpdates = 0;
        let numDeletes = 0;

        let insertedEntities = new Set<string>();
        this.addedComponents.forEach(arr => {
            let [entity, componentType] = arr;
            if (this.entityManager.getComponent(entity, ComponentId.Player)) return;
            let component = this.entityManager.getComponent<SerializableComponent>(entity, componentType);
            if (!component || !component.serialize) return;

            this.db.run(`INSERT INTO components (type, entity, data) VALUES (?, ?, ?)`, [componentType, entity, component.serialize()]);
            insertedEntities.add(arr[0]);
            numInserts++;
        });
        this.addedComponents = [];

        this.replacedComponents.forEach(arr => {
            let [entity, componentType] = arr;
            let component = this.entityManager.getComponent<SerializableComponent>(entity, componentType);
            if (!component || !component.serialize) return;
            this.db.run(`UPDATE components SET data = ? WHERE type = ? AND entity = ?`, [component.serialize(), componentType, entity]);
            numUpdates++;
        });
        this.replacedComponents = [];

        this.removedComponents.forEach(arr => {
            let [entity, componentType] = arr;
            this.db.run(`DELETE FROM components WHERE type = ? AND entity = ?`, [componentType, entity]);
            numDeletes++;
        });
        this.removedComponents = [];

        // Save dirty chunks, but not if they were just inserted (included in insertedEntities).
        this.entityManager.getEntities(ComponentId.TerrainChunk).forEach((component: TerrainChunkComponent, entity: string) => {
            if (component.isDirty('data') && !insertedEntities.has(entity)) {
                this.db.run(`UPDATE components SET data = ? WHERE type = ? AND entity = ?`, [component.serialize(), ComponentId.TerrainChunk, entity]);
                numUpdates++;
            }
        });

        if(numInserts || numUpdates || numDeletes) {
            console.log(`Inserts: ${numInserts} | Updates: ${numUpdates} | Deletes: ${numDeletes}`);
        }

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