import { TetrisGame } from "./TetrisGame";

export class KeyFrameEvent { 
    userId: string;
    event: PlayerEventType;
    keyframe: number;
    sequence: number;

    public constructor(userId: string, event: PlayerEventType, keyframe: number, sequence: number) {
        this.userId = userId;
        this.event = event;
        this.keyframe = keyframe;
        this.sequence = sequence;
    }

    public fromGame(game: TetrisGame, userId: string, event: PlayerEventType) {
        return new KeyFrameEvent(userId, event, game.stepId, game.sequence);
    }
}

export enum PlayerEventType {
    MOVE_LEFT = 0,
    MOVE_RIGHT = 1,
    TURN_LEFT = 2,
    TRUN_RIGHT = 3
}

export class MultiPlayerContext {
    public userId: string;
    public lastSequence: number;
    public lastKeyframe: number;

    public constructor(userId: string) {
        this.userId = userId;
        this.lastSequence = 0;
        this.lastKeyframe = 0;
    }

    public isEventValid(event: KeyFrameEvent) {
        if (this.lastSequence !== event.sequence + 1) {
            return false; 
        }

        if (this.lastKeyframe > event.keyframe) {
            return false;
        }

        return true;
    }

    public updateNewEvent(event: KeyFrameEvent) {
        this.lastSequence = event.sequence;
        this.lastKeyframe = event.keyframe;
    }
}