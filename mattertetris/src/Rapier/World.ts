import { TetrisOption } from "./TetrisOption";

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
    let num = 1;
    let numy = 1;
    let rad = 1.0;

    let shift = rad * 2.0 + rad; 
    let centerx = shift * (num / 2);
    let centery = shift / 2.0;

    let i, j;

    for (j = 0; j < numy; ++j) {
        for (i = 0; i < num; ++i) {
            let x = i * shift - centerx + 400.0 ;
            let y = j * shift + centery + 400.0;

            // Create dynamic cube.
            let bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y);
            let body = world.createRigidBody(bodyDesc);
            let colliderDesc = RAPIER.ColliderDesc.cuboid(rad, rad).setTranslation(0, 0);
            let colliderDesc2 = RAPIER.ColliderDesc.cuboid(rad, rad).setTranslation(0, 1 * 2 * rad);
            let colliderDesc3 = RAPIER.ColliderDesc.cuboid(rad, rad).setTranslation(0, 2 * 2 * rad);
            let colliderDesc4 = RAPIER.ColliderDesc.cuboid(rad, rad).setTranslation(0, 3 * 2 * rad);
            world.createCollider(colliderDesc, body);
            world.createCollider(colliderDesc2, body);
            world.createCollider(colliderDesc3, body);
            world.createCollider(colliderDesc4, body);
            body.addTorque(1, true);

            world.createCollider(RAPIER.ColliderDesc.convexHull(new Float32Array([0, 0, 100, 100, 100, -100]))!, body);
        }
    }
    return world;
}

function createWall(canvasWidth: number, canvasHeight: number, width: number, height: number, blockSize: number) {
    const wall_thick = 60;
    const ground = {
        x: 0,
        y: 0,
        hx: 10000,
        hy: 50,
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