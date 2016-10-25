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
    ChatMessage,
    ChunkRequest,

    // Client
    Mesh,
    AnimatedMesh,
    PlayerSelection,
    Player,
    PlayerChunk,

    // Server
    Network,
    NewPlayer,
    Pickable,
}

export const enum SystemOrder {
    ActionExecution = 1,
    Initializer,
    TerrainChunk,
    Block,
    InformNewPlayers,
    BroadcastPlayerInput,
    Chat,
    PlayerInput,
    Physics,
    TerrainCollision,
    Position,
    PlayerInputSync,
    Mesh,
    PlayerMesh,
    PlayerSelection,
    Chunk,
    ChunkRequest,
    PlayerAction,
    PickUp,
    BroadcastEntity,
    Sound,
    InventoryUI,
    DebugText,

    // Do not put any systems after these three.
    Network,
    Database,
    CleanComponents
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

// Physics
export const PlayerSpeed = 6;
export const PlayerJumpVelocity = 15;
export const Gravity = 90;
export const TerminalVelocity = 45;

// Chat
export const ChatLogSize = 6;
export const ChatMaxLength = 120;

// Other
export const ViewDistance = 5;