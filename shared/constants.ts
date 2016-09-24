export const TERRAIN_CHUNK_SIZE = 16;

// Message types
export const MSG_ENTITY = 1;
export const MSG_TERRAIN = 2;
export const MSG_ACTION = 3;

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

    // Client
    Mesh,
    PlayerSelection,
    Player,

    // Server
    Network,
    ChunkSubscription,
    NewPlayer,
}

export const enum Side {
    Top = 1,
    North,
    East,
    South,
    West,
    Bottom
}
