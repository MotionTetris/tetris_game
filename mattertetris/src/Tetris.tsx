import React, { useEffect, useRef, useState } from "react";
import { TetrisGame } from "./Rapier/TetrisGame.ts";
import { initWorld } from "./Rapier/World.ts";
import { calculatePosition, removeLines } from "./Rapier/BlockRemove.ts";
import { Tetromino } from "./Rapier/Tetromino.ts";
import { calculateLineIntersectionArea } from "./Rapier/BlockScore.ts";
import { createLines } from "./Rapier/Line.ts";
import { Container, SceneCanvas, EffectCanvas, VideoContainer, Video, VideoCanvas } from "./style.tsx";
import { createLineEffect } from "./Rapier/Effect.ts";
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
    const event = (event: any) => {
      console.log("충돌!", event);
      
    }
    const game = new TetrisGame({
      blockFriction: 1.0,
      blockSize: 32,
      blockRestitution: 0.0,
      combineDistance: 1,
      view: sceneRef.current,
      spawnX: sceneRef.current.width / 2,
      blockCollisionCallback: event
    });

    game.setWorld(initWorld(RAPIER, {
      blockFriction: 1.0,
      blockSize: 32,
      blockRestitution: 0.0,
      combineDistance: 1,
      view: sceneRef.current,
      spawnX: sceneRef.current.width / 2,
      blockCollisionCallback: event
    }));
    game.graphics.ticker.start();
    runPosenet(videoRef, canvasRef, game);
    game.run();

    // setInterval(() => {
    //   let block = game.spawnBlock(0xFF0000, "J")
    //   const area = calculateLineIntersectionArea(block.rigidBody, [[[10000, -568], [-10000, -568], [-10000, -600], [10000, -600], [10000, -568]]]);
    //   console.log(area);
    // }, 1000);
    // TODO: DO NOT CREATE BLOCK WITH SETINTERVAL BECAUSE IT IS NON-DETERMINSTIC (IT IS NOT ACCURACY TIMER!)
    let removed = false;
    let id = setInterval(() => {
      //game.spawnBlock(0xFF0000, "T", true);
      //game.checkAndRemoveLines(2000);
    }, 8000);
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