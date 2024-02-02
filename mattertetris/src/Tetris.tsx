import React, { useEffect, useRef, useState } from "react";
import { Socket } from "./SocketClient/socket.ts";
import { TetrisGame } from "./Rapier/TetrisGame.ts";
import { initWorld } from "./Rapier/World.ts";

const socket = new Socket();
let playerScore = 0;
const RAPIER = await import('@dimforge/rapier2d')
const Tetris: React.FC = () => {
  const sceneRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!!!sceneRef.current) {
      console.log("sceneRef is null");
      return;
    }

    const game = new TetrisGame(sceneRef.current, {
      blockFriction: 1.0,
      blockSize: 32,
      blockRestitution: 0.0,
      combineDistance: 1,
      view: sceneRef.current
    });
    console.log(RAPIER);
    game.setWorld(initWorld(RAPIER, {
      blockFriction: 1.0,
      blockSize: 32,
      blockRestitution: 0.0,
      combineDistance: 1,
      view: sceneRef.current
    }));

    game.run();
  return () => {}}, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <canvas
        id="game"
        ref={sceneRef}
        style={{
          width: "600px",
          height: "800px",
          marginRight: "150px",
          position: "relative",
        }}
      >
    </canvas>
    </div>
  );
};

export default Tetris;
