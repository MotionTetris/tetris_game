import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import type * as RAPIER from "@dimforge/rapier2d";

type RAPIER_API = typeof import("@dimforge/rapier2d");

const BOX_INSTANCE_INDEX = 0;
const BALL_INSTANCE_INDEX = 1;

var kk = 0;

export class Graphics {
    coll2gfx: Map<number, PIXI.Graphics>;
    colorIndex: number;
    colorPalette: Array<number>;
    renderer: PIXI.Renderer;
    scene: PIXI.Container;
    viewport: Viewport;
    instanceGroups: Array<Array<PIXI.Graphics>>;
    lines: PIXI.Graphics;

    constructor(canvas: HTMLCanvasElement) {
        // High pixel Ratio make the rendering extremely slow, so we cap it.
        const pixelRatio = window.devicePixelRatio ? Math.min(window.devicePixelRatio, 1.5) : 1;

        this.coll2gfx = new Map();
        this.colorIndex = 0;
        this.colorPalette = [0xf3d9b1, 0x98c1d9, 0x053c5e, 0x1f7a8c];
        this.renderer = new PIXI.Renderer({
            backgroundColor: 0x292929,
            antialias: true,
            view: canvas
        });

        this.scene = new PIXI.Container();

        this.viewport = new Viewport({
            screenWidth: canvas.width,
            screenHeight: canvas.height,
            worldWidth: 600,
            worldHeight: 800,
            // @ts-ignore
            events: this.renderer.events
        });

        //this.scene.addChild(this.viewport);

        
        this.instanceGroups = [];
        this.initInstances();
        this.lines = new PIXI.Graphics();
        this.viewport.addChild(this.lines);
    }

    initInstances() {
        this.instanceGroups = [];
        this.instanceGroups.push(
            this.colorPalette.map((color) => {
                let graphics = new PIXI.Graphics();
                graphics.beginFill(color);
                graphics.drawRect(-1.0, 1.0, 2.0, -2.0);
                graphics.endFill();
                return graphics;
            }),
        );

        this.instanceGroups.push(
            this.colorPalette.map((color) => {
                let graphics = new PIXI.Graphics();
                graphics.beginFill(color);
                graphics.drawCircle(0.0, 0.0, 1.0);
                graphics.endFill();
                return graphics;
            }),
        );
    }

    render(world: RAPIER.World) {
        kk += 1;
        this.updatePositions(world);
        this.renderer.render(this.scene);
    }

    updatePositions(world: RAPIER.World) {
        world.forEachCollider((elt) => {
            let gfx = this.coll2gfx.get(elt.handle);
            let translation = elt.translation();
            let rotation = elt.rotation();

            if (!!gfx) {
                gfx.position.x = translation.x;
                gfx.position.y = -translation.y;
                gfx.rotation = -rotation;
            }
        });
    }

    reset() {
        this.coll2gfx.forEach((gfx) => {
            this.viewport.removeChild(gfx);
            gfx.destroy();
        });
        this.coll2gfx = new Map();
        this.colorIndex = 0;
    }

    lookAt(pos: {zoom: number; target: {x: number; y: number}}) {
        this.viewport.setZoom(pos.zoom);
        this.viewport.moveCenter(pos.target.x, pos.target.y);
    }

    addCollider(
        RAPIER: RAPIER_API,
        world: RAPIER.World,
        collider: RAPIER.Collider,
    ) {
        let i;
        let parent = collider.parent();
        let instance;
        let graphics;
        let vertices;
        // @ts-ignore
        let instanceId = parent.isFixed() ? 0 : this.colorIndex + 1;

        switch (collider.shapeType()) {
            case RAPIER.ShapeType.Cuboid:
                let hext = collider.halfExtents();
                instance = this.instanceGroups[BOX_INSTANCE_INDEX][instanceId];
                graphics = instance.clone();
                graphics.scale.x = hext.x;
                graphics.scale.y = hext.y;
                graphics.beginFill(this.colorPalette[instanceId], 1.0);
                graphics.endFill();
                this.viewport.addChild(graphics);
                console.log(this.viewport);
                break;
            case RAPIER.ShapeType.Ball:
                let rad = collider.radius();
                instance = this.instanceGroups[BALL_INSTANCE_INDEX][instanceId];
                graphics = instance.clone();
                graphics.scale.x = rad;
                graphics.scale.y = rad;
                this.viewport.addChild(graphics);
                break;
            case RAPIER.ShapeType.Polyline:
                vertices = Array.from(collider.vertices());
                graphics = new PIXI.Graphics();
                graphics
                    .lineStyle(0.2, this.colorPalette[instanceId])
                    .moveTo(vertices[0], -vertices[1]);

                for (i = 2; i < vertices.length; i += 2) {
                    graphics.lineTo(vertices[i], -vertices[i + 1]);
                }

                this.viewport.addChild(graphics);
                break;
            case RAPIER.ShapeType.HeightField:
                let heights = Array.from(collider.heightfieldHeights());
                let scale = collider.heightfieldScale();
                let step = scale.x / (heights.length - 1);

                graphics = new PIXI.Graphics();
                graphics
                    .lineStyle(0.2, this.colorPalette[instanceId])
                    .moveTo(-scale.x / 2.0, -heights[0] * scale.y);

                for (i = 1; i < heights.length; i += 1) {
                    graphics.lineTo(
                        -scale.x / 2.0 + i * step,
                        -heights[i] * scale.y,
                    );
                }

                this.viewport.addChild(graphics);
                break;
            case RAPIER.ShapeType.ConvexPolygon:
                vertices = Array.from(collider.vertices());
                graphics = new PIXI.Graphics();
                graphics.beginFill(this.colorPalette[instanceId], 1.0);
                graphics.moveTo(vertices[0], -vertices[1]);

                for (i = 2; i < vertices.length; i += 2) {
                    graphics.lineTo(vertices[i], -vertices[i + 1]);
                }

                this.viewport.addChild(graphics);
                break;
            default:
                console.log("Unknown shape to render.");
                break;
        }

        if (!graphics) {
            return;
        }

        let t = collider.translation();
        let r = collider.rotation();
        //        dummy.position.set(t.x, t.y, t.z);
        //        dummy.quaternion.set(r.x, r.y, r.z, r.w);
        //        dummy.scale.set(instanceDesc.scale.x, instanceDesc.scale.y, instanceDesc.scale.z);
        //        dummy.updateMatrix();
        //        instance.setMatrixAt(instanceDesc.elementId, dummy.matrix);
        //        instance.instanceMatrix.needsUpdate = true;
        graphics.position.x = t.x;
        graphics.position.y = -t.y;
        graphics.rotation = r;

        this.coll2gfx.set(collider.handle, graphics);
        this.colorIndex =
            (this.colorIndex + 1) % (this.colorPalette.length - 1);
    }
}