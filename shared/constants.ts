export const TERRAIN_CHUNK_SIZE = 16;

// Message types
export const enum MessageType {
    Entity = 1,
    Terrain = 2,
    Action = 3
}

export const enum ComponentId {
    // Shared
    Position = 1,
    Rotation,
    Physics,
    OnGround,
    WallCollision,
    Input,
    CurrentPlayer,
    TerrainChunk,
    Inventory,
    Block,
    ChatLog,
    ChatMessage,

    // Client
    Mesh,
    PlayerSelection,
    Player,

    // Server
    Network,
    ChunkSubscription,
    NewPlayer,
    Pickable,
}

export const enum Side {
    Top = 1,
    North,
    East,
    South,
    West,
    Bottom
}

export const enum BlockId {
    Air = 0,
    Dirt,
    Grass,
    Stone,
    Sand,
    Wood
}

export const enum ActionId {
    UnsubscribeTerrainChunks = 1,
    SetBlocks,
    RemoveEntities,
    MoveEntity,
    PickUpEntity
}

export const PlayerSpeed = 6;
export const PlayerJumpVelocity = 15;
export const Gravity = 90;
export const TerminalVelocity = 45;