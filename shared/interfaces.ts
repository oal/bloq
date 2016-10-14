export interface EntityMessage {
    entity: string,
    components: {
        [propName: number]: Object
    }
}