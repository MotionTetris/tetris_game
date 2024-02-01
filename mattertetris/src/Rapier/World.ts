import { TetrisOption } from "../Tetris/TetrisGame";

type RAPIER_API = typeof import("@dimforge/rapier2d");

export function initWorld(RAPIER: RAPIER_API, option: TetrisOption) {
    let gravity = new RAPIER.Vector2(0.0, -9.81);
    let world = new RAPIER.World(gravity);
    let wall = createWall(option.view.width, option.view.height, 10, 20, option.blockSize);
    
    wall.forEach((ground) => {
        let bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
            ground.x,
            ground.y
        );

        let body = world.createRigidBody(bodyDesc);
        let colliderDesc = RAPIER.ColliderDesc.cuboid(ground.hx, ground.hy);
        world.createCollider(colliderDesc, body);
    });
}

function createWall(canvasWidth: number, canvasHeight: number, width: number, height: number, blockSize: number) {
    const wall_thick = 60;
    const ground = {
        x: canvasWidth / 2,
        y: height * blockSize + wall_thick / 2,
        hx: canvasWidth,
        hy: wall_thick,
    }

    const left_wall = {
        x: canvasWidth / 2 - width / 2 * blockSize - wall_thick / 2,
        y: canvasHeight / 2,
        hx: wall_thick, 
        hy: canvasHeight
    }

    const right_wall = {
        x: canvasWidth / 2 + width / 2 * blockSize + wall_thick / 2, 
        y: canvasHeight / 2,
        hx: wall_thick,
        hy: canvasHeight
    }

    return [ground, left_wall, right_wall];
}