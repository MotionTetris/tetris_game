import Matter, { Bodies, Vertices, World, Body, Vector, Engine, Events } from "matter-js";
import Mapper from "./Mapper";
import { Geometry, diff, intersection } from "martinez-polygon-clipping";
import UnionFind from "./UnionFind";
import { Tetromino } from "./Tetromino";
import { Wall } from "./Wall";
import backgroundSound from "../assets/sounds_themeA.ogg";

export interface TetrisOption {
    engine: Matter.Engine;
    runner: Matter.Runner;
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

export interface BlockCollisionCallbackParam {
    bodyA: Body;
    bodyB: Body;
}

export default class TetrisGame {
    private option: TetrisOption;
    private _fallingBlock?: Body;
    private blocks: Map<Matter.Body, Tetromino>;
    private wall: Wall;
    private lines: number[][][][];
    private _appropriateScore;
    private _bgm: HTMLAudioElement;

    public constructor(option: TetrisOption) {
        this.option = option;
        this.option.spawnX ??= this.option.view.width / 2;
        this.option.spawnY ??= this.option.blockSize * 4;
        this.option.combineDistance = 1;
        this.blocks = new Map();
        this.lines = this.createLines(0, option.blockSize * 20, option.blockSize);
        this.wall = new Wall(this, option);
        this._appropriateScore = option.blockSize * option.blockSize * 8;
        this.wall.rigidBodies.forEach((value) => this.addToWorld(value));
        console.log(this.lines);
        Events.on(this.option.engine, "collisionStart", (event) => this.onCollisionStart(event));
        this._bgm = new Audio(backgroundSound);
        document.body.appendChild(this._bgm);
        console.log(this._bgm);
        this._bgm.addEventListener('timeupdate', function(){
            var buffer = .25;
            if(this.currentTime > this.duration - buffer){
                this.currentTime = 0
                this.play()
            }
        });
    }

    public get appropriateScore() {
        return this._appropriateScore;
    }

    public get fallingBlock() {
        return this._fallingBlock;
    }

    public get bgm() {
        return this._bgm;
    }

    public update() {
        Matter.Engine.update(this.option.engine, 1000 / 60)
        this.blocks.forEach((value) => {
            value.update();
        });
    }

    public dispose() {
        Engine.clear(this.option.engine);
        Events.off(this.option.engine, "collisionStart", this.onCollisionStart);
    }

    public pause() {
        this.option.runner.enabled = false;
        console.log("Engine paused");
    }

    public resume() {
        this.option.runner.enabled = true;
        console.log("Engine resume");
    }

    public createLines(startY: number, endY: number, blockSize: number, x: number = 10000) {
        let lines: number[][][][] = [];
        for (let i = startY; i <= endY + blockSize; i += blockSize) {
            lines.push([[[x, i], [x, i + blockSize], [-x, i + blockSize], [-x, i], [x, i]]]);
        }
        return lines;
    }

    public setWorldBounds() {
        const ground = Bodies.rectangle(300, 30 * 20, 610, 60, {
            isStatic: true,
            label: 'ground'
        });

        const leftWall = Bodies.rectangle(100, 370, 60, 700, {
            isStatic: true,
            friction: 0,
            label: 'wall'
        });

        const rightWall = Bodies.rectangle(500, 370, 60, 700, {
            isStatic: true,
            friction: 0,
            label: 'wall'
        });

        const wall = [ground, leftWall, rightWall];
        wall.forEach((value) => this.addToWorld(value));
    }
    
    public getSpriteFromBody(body: Body) {
        return this.blocks.get(body);
    }

    public removeFromWorld(body: Body) {
        let block = this.blocks.get(body);
        if (block) {
            block.remove();
            this.blocks.delete(body);
        }

        World.remove(this.option.engine.world, body);
    }

    public addToWorld(body: Body, block?: Tetromino) {
        World.add(this.option.engine.world, body);
        
        if (block) {
            this.blocks.set(body, block);
        }
    }

    public spawnNewBlock() {
        const newBlock = new Tetromino(this, this.option);
        this._fallingBlock = newBlock.rigidBody;
        this.addToWorld(newBlock.rigidBody, newBlock);
    }

    // #region Score calculations
    private calculateArea(vertices: any) {
        const n = vertices.length;
        let area = 0;

        for (let i = 0; i < n; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % n];
            area += (current.x * next.y) - (next.x * current.y);
        }

        area = Math.abs(area) / 2;
        return area;
    }

    public calculateLineArea(block: Body, line: Geometry) {
        let sum = 0;
        const body = block;

        for (let i = 1; i < body.parts.length; i++) {
            const part = body.parts[i];
            const poly = Mapper.vectorsToGeoJSON(part);
            const intersectionResult = intersection(poly, line);
            if (!intersectionResult) {
                continue;
            }
            sum += this.calculateArea(Mapper.geoJSONToVectors(intersectionResult[0]));
        }

        return sum;
    }

    public checkAndRemoveLines(threshold: number) {
        let scoreSum = 0;
        const bodies = [...this.blocks.keys()];
        const lineToRemove = [];
        for (let i = 0; i < this.lines.length; i++) {
            let score = 0;
            for (let j = 0; j < bodies.length; j++) {
                score += this.calculateLineArea(bodies[j], this.lines[i]);
            }

            console.log(`line[${i}]`, score);
            if (score >= threshold) {
                scoreSum += score;
                lineToRemove.push(i);
            }
        }

        const lineIndex = lineToRemove.pop();
        if (!lineIndex) {
            return;
        }
        for (let j = 0; j < bodies.length; j++) {
            let result = this.removeLines(bodies[j], this.lines[lineIndex]);
            if (result) {
                this.removeFromWorld(bodies[j]);
                result.forEach((value) => {
                    if (value.area < 20) {
                        // to small then ignore
                        return;
                    }
                    const newBody = value;
                    this.addToWorld(newBody, new Tetromino(this, this.option, newBody));
                });
            }
        }
    }
    // #endregion

    // #region Remove Lines 
    private removeLines(body: Body, line: Geometry) {
        const diffResults: Body[] = [];

        for (let i = 1; i < body.parts.length; i++) {
            const part = body.parts[i];
            const geoJSON = Mapper.vectorsToGeoJSON(part);
            const diffResult = diff(geoJSON, line);
            diffResults.push(...diffResult.map((r) => this.createRigidBody(r, body.parts[i].render.fillStyle)));
        }

        if (diffResults.length === 0) {
            return;
        }

        /* Merge new bodies. */
        const unionFind = new UnionFind(diffResults.length);
        for (let i = 0; i < diffResults.length; i++) {
            for (let j = i + 1; j < diffResults.length; j++) {
                let shouldCombine = this.shouldCombine(diffResults[i].vertices, diffResults[j].vertices, this.option.combineDistance);
                if (shouldCombine) {
                    unionFind.union(i, j);
                }
            }
        }

        const group = new Map<number, Body[]>();
        for (let i = 0; i < diffResults.length; i++) {
            let root = unionFind.find(i);
            if (group.get(root)) {
                group.get(root)?.push(diffResults[i]);
                continue;
            }

            group.set(root, []);
            group.get(root)?.push(diffResults[i]);
        }

        const bodyToAdd: Body[] = [];
        group.forEach((value) => {
            let body = Body.create({
                parts: value
            });
            bodyToAdd.push(body);
        });

        return bodyToAdd;
    }

    private shouldCombine(body1: Vector[], body2: Vector[], maxDistance: number) {
        for (let i = 0; i < body1.length; i++) {
            for (let j = 0; j < body2.length; j++) {
                let distance = calculateDistance(body1[i], body2[j]);
                if (distance <= maxDistance) {
                    return true;
                }
            }
        }

        function calculateDistance(point1: Vector, point2: Vector) {
            let dx = point1.x - point2.x;
            let dy = point1.y - point2.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        return false;
    }

    private createRigidBody(geometry: any, style?: string) {
        const points = Mapper.geoJSONToVectors(geometry);
        return Bodies.fromVertices(Vertices.centre(points).x, Vertices.centre(points).y, points, {
            render: { fillStyle: style }
        });
    }
    // #endregion

    // #region Game events
    private onCollisionStart(event: Matter.IEventCollision<Engine>): void {
        const hasCollidedWithWall = (bodyA: Body, bodyB: Body) => {
            return bodyA.parent.label.includes("wall") || bodyB.parent.label.includes("wall");
        }

        const isBlockLanded = (bodyA: Body, bodyB: Body) => {
            return bodyA.parent === this._fallingBlock || bodyB.parent === this._fallingBlock;
        }

        const pairs = event.pairs;
        for (let i = 0; i < pairs.length; i++) {
            const { bodyA, bodyB } = pairs[i];
            if (hasCollidedWithWall(bodyA, bodyB)) {
                if (bodyA === this._fallingBlock || bodyB === this._fallingBlock) {
                    Body.setVelocity(this._fallingBlock!, {x: 0, y: this._fallingBlock!.velocity.y});
                }
                return;
            }

            if (isBlockLanded(bodyA, bodyB)) {
                this._fallingBlock = undefined;
                if (this.option.blockLandingCallback) {
                    this.option.blockLandingCallback({ bodyA, bodyB });
                }
            }

            if (this.option.blockCollisionCallback) {
                this.option.blockCollisionCallback({ bodyA, bodyB });
            }
        }
    }

    public onKeyboardEvent(event: KeyboardEvent) {
        if (this._bgm.played) {
            this._bgm.play();
        }
        console.log("키보드 이벤트", event);
        switch (event.key) {
            case "a":
                if (!this._fallingBlock) {
                    console.log("a");
                    return;
                }
                this._fallingBlock.position.x = this._fallingBlock.position.x - 0.2;
                break;
            case "s":
                break;
            case "d":
                if (!this._fallingBlock) {
                    return;
                }
                this._fallingBlock.position.x = this._fallingBlock.position.x + 0.2;
                break;
            case "r":
                if (!this._fallingBlock) {
                    return;
                }
                Body.rotate(this._fallingBlock, Math.PI/180 * 90);
                break;
            case "l":
                if (!this._fallingBlock) {
                    return;
                }
                Body.rotate(this._fallingBlock, -Math.PI/180 * 90);
                break;
        }
    }
    // #endregion
}