import React, { useEffect, useRef, useState } from "react";
import { TetrisGame } from "./Rapier/TetrisGame.ts";
import { initWorld } from "./Rapier/World.ts";
import { calculatePosition, removeLines } from "./Rapier/BlockRemove.ts";
import { Tetromino } from "./Rapier/Tetromino.ts";
import { calculateLineIntersectionArea } from "./Rapier/BlockScore.ts";
import { createLines } from "./Rapier/Line.ts";
import { Container, SceneCanvas, EffectCanvas, VideoContainer, Video, VideoCanvas } from "./style.tsx";
import { collisionParticleEffect, createLineEffect, explodeParticleEffect } from "./Rapier/Effect.ts";
import * as PIXI from "pixi.js";
import { runPosenet } from "./Rapier/WebcamPosenet.ts";
import "@tensorflow/tfjs";


let playerScore = 0;
const RAPIER = await import('@dimforge/rapier2d')
const Tetris: React.FC = () => {
  const sceneRef = useRef<HTMLCanvasElement>(null);  //게임화면
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {

    if (!!!sceneRef.current) {
      console.log("sceneRef is null");
      return;
    }
    
    sceneRef.current.width = 600;
    sceneRef.current.height = 800;
    const CollisionEvent = ({bodyA, bodyB}: any) => {
      // console.log(bodyA.translation().x, bodyB.translation().y);
      // 두 콜라이더의 위치를 평균내어 충돌 위치를 계산

    }

    const LandingEvent = ({bodyA, bodyB}: any) => {
      let collisionX = (bodyA.translation().x + bodyB.translation().x) / 2;
      let collisionY = (bodyA.translation().y + bodyB.translation().y) / 2;
      //collisionParticleEffect(collisionX, -collisionY, game.graphics.viewport, game.graphics.renderer);
      console.log("랜딩!");
      const checkResult = game.checkLine(10000);
      // for (let i = 0; i < checkResult.lineIndices.length; i++) {
      //   explodeParticleEffect(game.graphics.viewport, game.graphics.scene, 140, checkResult.lineIndices[i]);
      // }
      if (game.removeLines(checkResult.lines)) {
        console.log(`score: ${checkResult.area}`);
      }
      
      game.spawnBlock(0xFF0000, "I", true);
    }

    const game = new TetrisGame({
      blockFriction: 1.0,
      blockSize: 32,
      blockRestitution: 0.0,
      combineDistance: 1,
      view: sceneRef.current,
      spawnX: sceneRef.current.width / 2,
      spawnY: 100,
      blockCollisionCallback: CollisionEvent,
      blockLandingCallback: LandingEvent
    }, false);

    game.setWorld(initWorld(RAPIER, {
      blockFriction: 1.0,
      blockSize: 32,
      blockRestitution: 0.0,
      combineDistance: 1,
      view: sceneRef.current,
      spawnX: sceneRef.current.width / 2,
      spawnY: 200,
      blockCollisionCallback: CollisionEvent,
      blockLandingCallback: LandingEvent
    }));
    
    runPosenet(videoRef, canvasRef, game);
    game.run();
    game.spawnBlock(0xFF0000, "S", true);
  return () => {}}, []);

  return (
    <Container>
      <SceneCanvas id = "game" ref = {sceneRef}> </SceneCanvas>
      <VideoContainer>
        <Video ref={videoRef} autoPlay/>
        <VideoCanvas ref={canvasRef}/>
      </VideoContainer>
    </Container>

  );
};

export default Tetris;