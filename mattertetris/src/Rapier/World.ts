import { TetrisOption } from "./TetrisOption";

type RAPIER_API = typeof import("@dimforge/rapier2d");

export function initWorld(RAPIER: RAPIER_API, option: TetrisOption) {
    let gravity = new RAPIER.Vector2(0.0, -100);
    let world = new RAPIER.World(gravity);
    let wall = createWall(option.view.width, option.view.height, 10, 20, option.blockSize);
    
    wall.forEach((ground) => {
        let bodyDesc = RAPIER.RigidBodyDesc
                             .fixed()
                             .setTranslation(ground.x,ground.y)
                             .setUserData({type: ground.label});
                                           
        let body = world.createRigidBody(bodyDesc);

        let colliderDesc = RAPIER.ColliderDesc
                                 .cuboid(ground.hx, ground.hy)
                                 .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
        world.createCollider(colliderDesc, body);
    });

    return world;
}

function createWall(canvasWidth: number, canvasHeight: number, width: number, height: number, blockSize: number) {
    const wall_thick = 20;
    
    const ground = {
        x: canvasWidth / 2,
        y: -height * blockSize,
        hx: canvasWidth,
        hy: wall_thick,
        label: "ground"
    }   

    const left_wall = {
        x: canvasWidth / 2 - width / 2 * blockSize - wall_thick / 2 - 50,
        y: 0,
        hx: wall_thick, 
        hy: canvasHeight,
        label: "left_wall"
    }

    const right_wall = {
        x: canvasWidth / 2 + width / 2 * blockSize + wall_thick + 50, 
        y: 0,
        hx: wall_thick,
        hy: canvasHeight,
        label: "right_wall"
    }

    return [ground, left_wall, right_wall];
}