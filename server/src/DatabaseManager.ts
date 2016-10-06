import {Database} from 'sqlite3';
import EntityManager from "../../shared/EntityManager";
import {EntityManagerEvent} from "../../shared/EntityManager";
import {SerializableComponent} from "../../shared/components";

export default class DatabaseManager {
    private db: Database = new Database(':memory:'); // WIP, only in memory for now

    constructor() {
        this.init();
    }

    init() {
        this.db.serialize(() => {
            this.db.run(`
            CREATE TABLE components (
                type INTEGER,
                entity STRING,
                data BLOB
            );`);
        });
    }

    registerEntityEvents(em: EntityManager) {
        // em.addEventListener(EntityManagerEvent.ComponentAdded, this.onComponentAdded.bind(this))
    }

    onComponentAdded(entity: string, component: SerializableComponent) {
        console.log('COmponent added', entity, component);
    }
}