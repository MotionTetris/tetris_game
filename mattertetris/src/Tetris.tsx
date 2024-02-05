import React, { useEffect, useRef, useState } from "react";
import { TetrisGame } from "./Rapier/TetrisGame.ts";
import { initWorld } from "./Rapier/World.ts";
import { Container, SceneCanvas, EffectCanvas, VideoContainer, Video, VideoCanvas, MessageDiv } from "./style.tsx";
import { collisionParticleEffect, createLineEffect, explodeParticleEffect } from "./Rapier/Effect.ts";
import { runPosenet } from "./Rapier/WebcamPosenet.ts";
import "@tensorflow/tfjs";
import * as io from 'socket.io-client';
import { KeyFrameEvent } from "./Rapier/Multiplay";
import * as jwtDecode from 'jwt-decode';
import { TetrisMultiplay } from "./Rapier/TetrisMultiplay.ts";


let playerScore = 0;
const RAPIER = await import('@dimforge/rapier2d')
const Tetris: React.FC = () => {
  const sceneRef = useRef<HTMLCanvasElement>(null);  //게임화면
  const otherSceneRef = useRef<HTMLCanvasElement>(null);  //게임화면
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState("");
  // const socket = useRef<io.Socket | null>(null)
  const [user, setUser] = useState<string>('')
  const [other, setOther] = useState<string>('')

  // useEffect(()=>{ 
  //   // eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0bWFuIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxODE2MjM5MDIyfQ.Fx5xKjtPQHjYZWTcXkgLBYPL5BXFWELQx-rzAon_5vQ
  //   const token = localStorage.getItem('token')
  //   // if (token) {
  //     // const {sub:nickname} = jwtDecode(token); // 토큰 디코드
  //     // setUser(nickname);
  //   // }
  //   socket.current = io.connect('ws://localhost:3011?roomId=1',{
  //     auth:{
  //       token:`Bearer ${token}`
  //     }
  //   });

  //   socket.current.on('userJoined',(nickname:string)=>{
  //     console.log(nickname,'입장')
  //   });

  //   socket.current.on('userLeaved',(nickname:string)=>{
  //     console.log(nickname,'도망감 ㅋㅋ')
  //     setOther(nickname)
  //   })

  //   return ()=>{
  //     socket.current.disconnect();
  //   }
  // },[])

  useEffect(() => {
    if (!!!sceneRef.current) {
      console.error("sceneRef is null");
      return;
    }
    
    if (!!!otherSceneRef.current) {
      console.error("otherSceneRef is null");
      return;
    }
    
    sceneRef.current.width = 600;
    sceneRef.current.height = 800;
    otherSceneRef.current.width = 600;
    otherSceneRef.current.height = 800;
    const createLandingEvent = (game: TetrisGame) => {
      return ({bodyA, bodyB}: any) => {
        let collisionX = (bodyA.translation().x + bodyB.translation().x) / 2;
        let collisionY = (bodyA.translation().y + bodyB.translation().y) / 2;
        if (bodyA.translation().y > -400 || bodyB.translation().y > -400) {
          setMessage("게임오버")
          game.pause();
        }
        
        //collisionParticleEffect(collisionX, -collisionY, game.graphics.viewport, game.graphics.renderer);
        collisionParticleEffect(bodyA.translation().x, -bodyB.translation().y, game.graphics.viewport, game.graphics.renderer);
        collisionParticleEffect(bodyB.translation().x, -bodyB.translation().y, game.graphics.viewport, game.graphics.renderer);
        const checkResult = game.checkLine(5000);
        // for (let i = 0; i < checkResult.lineIndices.length; i++) {
        //   explodeParticleEffect(game.graphics.viewport, game.graphics.scene, 140, checkResult.lineIndices[i]);
        // }
        game.removeLines(checkResult.lines);
        game.spawnBlock(0xFF0000, "O", true);
      }
    }
    
    const gameOption = {
      blockFriction: 1.0,
      blockSize: 32,
      blockRestitution: 0.0,
      combineDistance: 1,
      view: sceneRef.current,
      spawnX: sceneRef.current.width / 2,
      spawnY: 200
    };

    const game = new TetrisGame(gameOption, user);
    const LandingEvent = createLandingEvent(game);
    game.landingCallback = LandingEvent;

    game.setWorld(initWorld(RAPIER, gameOption));
    
    game.running = true;

    game.spawnBlock(0xFF0000, "S", true); 

    const otherGameOption = {
      blockFriction: 1.0,
      blockSize: 32,
      blockRestitution: 0.0,
      combineDistance: 1,
      view: otherSceneRef.current,
      spawnX: otherSceneRef.current.width / 2,
      spawnY: 200
    };

    const userId = other;
    const otherGame = new TetrisMultiplay(otherGameOption, userId);
    const otherLandingEvent = createLandingEvent(otherGame);
    otherGame.landingCallback = otherLandingEvent;
    otherGame.running = false;
    otherGame.setWorld(initWorld(RAPIER, otherGameOption));
    otherGame.spawnBlock(0xFF0000, "S", true);

    runPosenet(videoRef, canvasRef, game, otherGame);

    game.run(); 
    otherGame.run();
  return () => {}}, []);

  return (
    <Container>
    <MessageDiv>{message}</MessageDiv>
      <SceneCanvas id="game" ref={sceneRef}> </SceneCanvas>
      <VideoContainer>
        <Video ref={videoRef} autoPlay/>
        <VideoCanvas ref={canvasRef}/>
      </VideoContainer>
      <SceneCanvas id="otherGame" ref={otherSceneRef}> </SceneCanvas>
    </Container>

  );
};

export default Tetris;