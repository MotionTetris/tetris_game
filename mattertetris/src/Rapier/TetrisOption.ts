export interface BlockCollisionCallbackParam {
    bodyA: any;
    bodyB: any;
}

export interface TetrisOption {
    blockCollisionCallback?: (result: BlockCollisionCallbackParam) => void;
    blockLandingCallback?: (result: BlockCollisionCallbackParam) => void;
    blockFriction: number;
    blockRestitution: number;
    blockSize: number;
    spawnX?: number;
    spawnY?: number;
    combineDistance: number;
    view: HTMLCanvasElement;
}
