import React, { useEffect, useRef, useState } from "react";
import {
  Engine,
  Render,
  Runner,
  Body,

} from "matter-js";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";
import TetrisGame, { BlockCollisionCallbackParam } from "./Tetris/TetrisGame.ts";
import * as PIXI from "pixi.js";
import Matter from "matter-js";
import { Socket } from "./SocketClient/socket.ts";
import { TetrisView } from "./Tetris/TetrisView.ts";

const socket = new Socket();
let playerScore = 0;
const Tetris: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLCanvasElement>(null);
  const blockRef = useRef<Body | null>(null); // 블록 참조 저장
  const hasCollidedRef = useRef(false);
  const [message, setMessage] = useState("");
  //const [playerScore, setPlayerScore] = useState(0);

  // 엔진 생성
  const engine = Engine.create({
    // 중력 설정
    gravity: {
      x: 0,
      y: 0.13,
    },
  });

  const otherEngine = Engine.create({
    gravity: {
      x: 0,
      y: 0.13,
    }
  })
  useEffect(() => {
    async function setupWebcam() {
      const video = document.createElement("video");
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;

        return new Promise<HTMLVideoElement>((resolve) => {
          videoRef.current!.onloadedmetadata = () => {
            resolve(videoRef.current!);
          };
        });
      }
      return video;
    }
    
    async function runPosenet() {
      const net = await posenet.load();
      const video = await setupWebcam();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      // 각도와 손목의 위치를 저장할 변수 선언
      let leftAngleInDegrees = 0;
      let prevLeftAngle = 0;
      let leftWristX = 0;
      let prevLeftWristX = 0;

      let rightAngleInDegrees = 0;
      let prevRightAngle = 0;
      let rightWristX = 0;
      let prevRightWristX = 0;

      let leftAngleDelta = 0;
      let rightAngleDelta = 0;

      let noseX = 0;

      setInterval(async () => {
        const pose = await net.estimateSinglePose(video, {
          flipHorizontal: true,
        });

        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          pose.keypoints.forEach((keypoint) => {
            if (
              keypoint.score >= 0.5 &&
              [
                "leftShoulder",
                "rightShoulder",
                "leftElbow",
                "rightElbow",
                "leftWrist",
                "rightWrist",
              ].includes(keypoint.part)
            ) {
              ctx.beginPath();
              ctx.arc(
                keypoint.position.x,
                keypoint.position.y,
                5,
                0,
                2 * Math.PI
              );
              ctx.fillStyle = "red";
              ctx.fill();
            } else if (keypoint.part === "nose") {
              ctx.beginPath();
              ctx.arc(
                keypoint.position.x,
                keypoint.position.y,
                10,
                0,
                2 * Math.PI
              );
              ctx.fillStyle = "blue";
              ctx.fill();
            }
          });

          const block = blockRef.current;

          //모션인식 키고싶으면 !block으로 할것
          if (!block || hasCollidedRef.current) {
            return;
          }

          let leftShoulderKeypoint = pose.keypoints.find(
            (keypoint) => keypoint.part === "leftShoulder"
          );
          let leftElbowKeypoint = pose.keypoints.find(
            (keypoint) => keypoint.part === "leftElbow"
          );
          let leftWristKeypoint = pose.keypoints.find(
            (keypoint) => keypoint.part === "leftWrist"
          );

          // 각 요소가 존재하는지 확인하고, 존재한다면 위치 정보를 가져옵니다.
          let leftShoulder = leftShoulderKeypoint
            ? leftShoulderKeypoint.position
            : null;
          let leftElbow = leftElbowKeypoint ? leftElbowKeypoint.position : null;
          let leftWrist = leftWristKeypoint ? leftWristKeypoint.position : null;

          if (leftShoulder && leftElbow && leftWrist) {
            let vectorA = {
              x: leftShoulder.x - leftElbow.x,
              y: leftShoulder.y - leftElbow.y,
            };
            let vectorB = {
              x: leftWrist.x - leftElbow.x,
              y: leftWrist.y - leftElbow.y,
            };

            let leftDotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
            let leftMagnitudeA = Math.sqrt(
              vectorA.x * vectorA.x + vectorA.y * vectorA.y
            );
            let leftMagnitudeB = Math.sqrt(
              vectorB.x * vectorB.x + vectorB.y * vectorB.y
            );

            let leftAngleInRadians = Math.acos(
              leftDotProduct / (leftMagnitudeA * leftMagnitudeB)
            );
            leftAngleInDegrees = leftAngleInRadians * (180 / Math.PI);

            leftWristX = leftWrist.x;
            leftAngleDelta = leftAngleInDegrees - prevLeftAngle;
          }

          let rightShoulderKeypoint = pose.keypoints.find(
            (keypoint: any) => keypoint.part === "rightShoulder"
          );
          let rightElbowKeypoint = pose.keypoints.find(
            (keypoint: any) => keypoint.part === "rightElbow"
          );
          let rightWristKeypoint = pose.keypoints.find(
            (keypoint: any) => keypoint.part === "rightWrist"
          );

          // 각 요소가 존재하는지 확인하고, 존재한다면 위치 정보를 가져옵니다.
          let rightShoulder = rightShoulderKeypoint
            ? rightShoulderKeypoint.position
            : null;
          let rightElbow = rightElbowKeypoint
            ? rightElbowKeypoint.position
            : null;
          let rightWrist = rightWristKeypoint
            ? rightWristKeypoint.position
            : null;

          if (rightShoulder && rightElbow && rightWrist) {
            let vectorA = {
              x: rightShoulder.x - rightElbow.x,
              y: rightShoulder.y - rightElbow.y,
            };
            let vectorB = {
              x: rightWrist.x - rightElbow.x,
              y: rightWrist.y - rightElbow.y,
            };

            let rightDotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
            let rightMagnitudeA = Math.sqrt(
              vectorA.x * vectorA.x + vectorA.y * vectorA.y
            );
            let rightMagnitudeB = Math.sqrt(
              vectorB.x * vectorB.x + vectorB.y * vectorB.y
            );

            let rightAngleInRadians = Math.acos(
              rightDotProduct / (rightMagnitudeA * rightMagnitudeB)
            );
            rightAngleInDegrees = rightAngleInRadians * (180 / Math.PI);

            rightWristX = rightWrist.x;
            // 각도의 변화값. (이전 각도와의 차이)
            rightAngleDelta = rightAngleInDegrees - prevRightAngle;
          }

          if (leftAngleDelta > rightAngleDelta) {
            if (
              leftAngleDelta > 35 &&
              leftAngleInDegrees > prevLeftAngle &&
              leftWristX < prevLeftWristX-20
            ) {
              const block = blockRef.current;
              if (block) {
                // block이 존재하는지 확인
                Body.rotate(block, -Math.PI / 4); // 45도 회전
                setMessage("왼쪽으로 회전!"); // 메시지를 변경합니다.
                setTimeout(() => setMessage(""), 500);
              }
            }
          } else {
            if (
              rightAngleDelta > 35 &&
              rightAngleInDegrees > prevRightAngle &&
              rightWristX-20 > prevRightWristX
            ) {
              const block = blockRef.current;
              if (block) {
                // block이 존재하는지 확인
                Body.rotate(block, Math.PI / 4); // 45도 회전
                setMessage("오른쪽으로 회전!");
                setTimeout(() => setMessage(""), 500);
              }
            }
          }

          let noseKeypoint = pose.keypoints.find(
            (keypoint) => keypoint.part === "nose"
          );

          // 각 요소가 존재하는지 확인하고, 존재한다면 위치 정보를 가져옵니다.
          let noseX = noseKeypoint
            ? noseKeypoint.position.x
            : null;

          let centerX = videoRef.current ? videoRef.current.offsetWidth / 2 : null;

          if (noseX && centerX) {
            let forceMagnitude = Math.abs(noseX - centerX) / (centerX*100); // 중앙에서 얼마나 떨어져 있는지에 비례하는 힘의 크기를 계산합니다.
            forceMagnitude = Math.min(forceMagnitude, 1); // 힘의 크기가 너무 커지지 않도록 1로 제한합니다.

            let block = blockRef.current; // 현재 블록에 대한 참조를 얻습니다.

            if (block) {
              if (noseX < centerX) {
                // 코의 x 좌표가 캔버스 중앙보다 왼쪽에 있다면, 블록에 왼쪽으로 힘을 가합니다.
                Body.applyForce(block, block.position, { x: -forceMagnitude, y: 0 });
              } else {
                // 코의 x 좌표가 캔버스 중앙보다 오른쪽에 있다면, 블록에 오른쪽으로 힘을 가합니다.
                Body.applyForce(block, block.position, { x: forceMagnitude, y: 0 });
              }
            }
          }

          prevLeftAngle = leftAngleInDegrees;
          prevRightAngle = rightAngleInDegrees;
          prevRightWristX = rightWristX;
          prevLeftWristX = leftWristX;
        }
      }, 250);
    }
    //runPosenet();

    if (!sceneRef.current) return;

    // 렌더러 시작
    
    async function block({bodyA, bodyB}: BlockCollisionCallbackParam) {
      if (bodyB.position.y < 10 || bodyA.position.y < 10) {
        return;
      }

      GAME.checkAndRemoveLines(GAME.appropriateScore);

      Body.setVelocity(bodyA, {x: 0, y: 0});
      Body.setVelocity(bodyB, {x: 0, y: 0});
      Body.setAngularSpeed(bodyA, 0);
      Body.setAngularSpeed(bodyB, 0);
      Body.setSpeed(bodyA, 0);
      Body.setSpeed(bodyB, 0);
      Body.setStatic(bodyA, true);
      Body.setStatic(bodyB, true);
      GAME.spawnNewBlock();
    }
    
    const render = Matter.Render.create({
      element: document.body,  // DOM element to render the canvas (document.body means it will be appended to the body)
      engine: engine,          // Reference to the Matter.js engine
      options: {
          width: 800,           // Width of the canvas
          height: 800,          // Height of the canvas
          wireframes: false     // Set to true for wireframe rendering
      }
  });
  const otherRender = Matter.Render.create({
    element: document.body,  // DOM element to render the canvas (document.body means it will be appended to the body)
    engine: otherEngine,          // Reference to the Matter.js engine
    options: {
        width: 800,           // Width of the canvas
        height: 800,          // Height of the canvas
        wireframes: false     // Set to true for wireframe rendering
    }
});
    const runner = Runner.create();
    const othersRunner = Runner.create();
    const GAME = new TetrisGame({
      combineDistance: 1,
      engine: engine,
      runner: runner,
      blockFriction: 1.0,
      blockRestitution: 0.0,
      blockSize: 32,
      blockLandingCallback: block,
      view: render.canvas,
      spawnY: -100
    });
    GAME.spawnNewBlock();
    // 엔진 실행
    
    Runner.run(runner, engine);
    Runner.run(othersRunner, otherEngine);
    render.canvas.tabIndex = 1;
    const event = (event: any) => GAME.onKeyboardEvent(event);
    render.canvas.addEventListener("keydown", event);
    render.canvas.focus();
    const view = new TetrisView(otherEngine,
      {
        combineDistance: 1,
        engine: otherEngine,
        runner: othersRunner,
        blockFriction: 1.0,
        blockRestitution: 0.0,
        blockSize: 32,
        blockLandingCallback: block,
        view: otherRender.canvas,
        spawnY: -100
      }
    )
    Matter.Render.run(render);
    Matter.Render.run(otherRender);
    socket.sock.on("sync", (data) => {
      view.applyWorld(data);
    });
    setInterval(() => {socket.sync(GAME.serialise());}, 100);
    
    return () => {
      console.log("제거");
      // 클린업 함수
      // 엔진 정지
      Engine.clear(engine);
      Engine.clear(otherEngine);
      // 렌더러 정지

      // Runner 정지
      Runner.stop(runner);
      Runner.stop(othersRunner);
      // setInterval 제거
      GAME.dispose();
      render.canvas.removeEventListener("keydown", event);
    };
  }, []);

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
        ref={sceneRef}
        style={{
          width: "600px",
          height: "800px",
          marginRight: "150px",
          position: "relative",
        }}
      >
        {" "}
        {/* position 속성을 추가합니다. */}
        <div
        style={{
          position: "absolute",
          top: "90%",
          left: "25%",
          color: "white",
          background: "rgba(255,0,0,0.5)",
          padding: "0px",
          fontSize: "48px",
        }}
      >
        {message}
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "30%",
          color: "white",
          background: "rgba(0,0,0,0.5)",
          padding: "10px",
          fontSize: "48px",
        }}
      >
        score: {playerScore}
      </div>
    </canvas>
      <div style={{ position: "relative", width: 480, height: 320 }}>
        <video
          ref={videoRef}
          autoPlay
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "scaleX(-1)",
          }}
          width="480"
          height="320"
        />
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
          width="480"
          height="320"
        />
      </div>
    </div>
  );
};

export default Tetris;
