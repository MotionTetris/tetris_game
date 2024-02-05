import { TetrisOption } from "./TetrisOption";
import { KeyFrameEvent, MultiPlayerContext, PlayerEventType } from "./Multiplay";
import { TetrisGame } from "./TetrisGame";

export class TetrisMultiplay extends TetrisGame {
    multiPlayerContext?: MultiPlayerContext;
    keyFrameBuffer: Array<KeyFrameEvent>;
    runOtherJob: boolean;
    constructor(option: TetrisOption, userId: string) {
        super(option, userId);
        this.keyFrameBuffer = [];
        this.runOtherJob = false;
        this.multiPlayerContext = new MultiPlayerContext(userId);
        
    }

    runKeyFrameEvent() {
        if (!this.runOtherJob && this.keyFrameBuffer.length > 10) {
            let recentEvent = this.keyFrameBuffer.shift();
            if (!recentEvent) {
                return;
            }
            this.stepKeyFrameEvent(recentEvent, recentEvent.sequence);
        }
    }

    receiveKeyFrameEvent(event: KeyFrameEvent) {
        this.keyFrameBuffer.push(event);
    }

    stepKeyFrameEvent(event: KeyFrameEvent, seq: number) {
        if (!this.multiPlayerContext) {
            console.error("This is not multiplayer view.");
            return;
        }

        if (!this.world) {
            console.error("Failed to step. world is not set");
            return;
        }

        if (seq !== event.sequence) {
            return;
        }

        this.runOtherJob = true;
        if (event?.keyframe > this.stepId) {
            this.world.step(this.events);
            this.stepId++;
            this.graphics.render(this.world, false);
            this.events.drainCollisionEvents((handle1: number, handle2: number, started: boolean) => {
                if (!started) {
                    return;
                }

                if (!this.world) {
                    console.error("Failed to run event. world is not set");
                    return;
                }

                const body1 = this.world.getCollider(handle1);
                const body2 = this.world.getCollider(handle2);
                this.onCollisionDetected(body1, body2);
            });

            requestAnimationFrame(() => this.stepKeyFrameEvent(event, seq));
            return;
        }

        if (event?.keyframe === this.stepId) {
            switch (event?.event) {
                case PlayerEventType.MOVE_LEFT:
                    this.fallingTetromino?.rigidBody.applyImpulse({x: -event?.userData * 100000, y: 0}, false);
                    console.log(`move_left at ${this.stepId} force: ${-event?.userData * 100000}, desired keyframe: ${event.keyframe}`);
                    break;
                case PlayerEventType.MOVE_RIGHT:
                    this.fallingTetromino?.rigidBody.applyImpulse({x: event?.userData * 100000, y: 0}, false);
                    console.log(`move_right at ${this.stepId} force: ${event?.userData * 100000}, desired keyframe: ${event.keyframe}`);
                    break;
                case PlayerEventType.TURN_LEFT:
                    this.fallingTetromino?.rigidBody.applyTorqueImpulse(1000000, false);
                    console.log(`turn_left at ${this.stepId}, desired keyframe: ${event.keyframe}`);
                    break;
                case PlayerEventType.TURN_RIGHT:
                    console.log(`turn_left at ${this.stepId}, desired keyframe: ${event.keyframe}`);
                    this.fallingTetromino?.rigidBody.applyTorqueImpulse(-1000000, false);
                    break;
                default:
                    console.log("이동X");
            }
            this.runOtherJob = false;
            return;
        }

        if (event?.keyframe > this.stepId) {
            throw new Error("동기화 에러!");
        }
    }

    private render() {
        if (!this.world) {
            console.error("Failed to render. world is not set");
            return;
        }

        this.graphics.render(this.world, false);
        this.runKeyFrameEvent();
        requestAnimationFrame(() => this.render());
    }

    run() {
        this.render();
    }
}