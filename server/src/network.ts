import EntityManager from "../../shared/EntityManager";

export function broadcastPlayerEntity(em: EntityManager, playerEntity: string, clients) {
    let playerData = em.serializeEntity(playerEntity);
    clients.forEach(client => {
        client.send(playerData);
    });
}

export function sendExistingPlayerEntities(em: EntityManager, playerEntity: string, ws) {
    em.getEntities('player').forEach((component, entity) => {
        if(entity === playerEntity) return; // Don't send the player's own entity again.

        let playerData = em.serializeEntity(entity);
        ws.send(playerData);
    })
}