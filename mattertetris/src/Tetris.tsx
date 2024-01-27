import { useEffect, useRef, useState } from "react";
import {
  Engine,
  Render,
  Runner,
  Bodies,
  World,
  Body,
  Events,
  Composite,
  Vertices,
  IChamferableBodyDefinition,
} from "matter-js";
import "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import * as Cutter from "martinez-polygon-clipping";
import * as PIXI from "pixi.js";

import {
  blockSize,
  createOBlock,
  createIBlock,
  createJBlock,
  createLBlock,
  createSBlock,
  createTBlock,
  createZBlock,
} from "./createblock.tsx";
import BlockInfo from "./blockinfo.tsx";
import { booleanMaskAsync } from "@tensorflow/tfjs";

import {
  UnionFind,
  createBody,
  verticesToGeometry,
  geoJsonToVectors,
  shouldCombine,
} from "./calcultate.tsx";
// 블록 생성 함수 배열
const blockCreators: Array<(x: number, y: number) => Body> = [
  createIBlock,
  createOBlock,
  createTBlock,
  createSBlock,
  createZBlock,
  createJBlock,
  createLBlock,
];

// 랜덤 인덱스 생성 함수
function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

// 랜덤한 블록 생성 함수
function createRandomBlock(x: number, randomIndex: number): Block {
  const createBlock = blockCreators[randomIndex];
  return createBlock(x, 0); // 화면의 중앙 상단에서 블록 생성
}

const line = [
  [
    [100, 490],
    [500, 490],
    [100, 550],
    [500, 550],
  ],
];

let nextBlockIndex: number = getRandomIndex(7);
let playerScore = 0;

interface Block extends Body {
  sprite?: PIXI.Sprite;
}
let engine: Engine;

function removeLines(body: any) {
  World.remove(engine.world, body);
  const bodyToAdd: any[] = [];
  console.log(body);
  for (let i = 1; i < body.parts.length; i++) {
    const part = body.parts[i];
    const poly = verticesToGeometry(part);
    const cut = Cutter.diff(poly, line);
    const cut1 = cut[0];
    const cut2 = cut[1];

    if (cut1) {
      bodyToAdd.push(createBody(cut1, body.parts[i].render.fillStyle));
    }

    if (cut2) {
      bodyToAdd.push(createBody(cut2, body.parts[i].render.fillStyle));
    }
  }

  let unionFind = new UnionFind(bodyToAdd);
  for (let i = 0; i < bodyToAdd.length; i++) {
    for (let j = i + 1; j < bodyToAdd.length; j++) {
      let result = shouldCombine(
        bodyToAdd[i].vertices,
        bodyToAdd[j].vertices,
        1
      );
      if (result) {
        unionFind.union(i, j);
      }
    }
  }

  const group = new Map<number, any[]>();
  for (let i = 0; i < bodyToAdd.length; i++) {
    let root = unionFind.find(i);
    if (group.get(root)) {
      group.get(root)?.push(bodyToAdd[i]);
    } else {
      group.set(root, []);
      group.get(root)?.push(bodyToAdd[i]);
    }
  }
  const realBodyToAdd: any[] = [];

  group.forEach((value) => {
    console.log("val", value);
    let add = Body.create({
      parts: value,
    } as IChamferableBodyDefinition);
    console.log("added:", add.id, value);
    realBodyToAdd.push(add);
  });

  World.add(engine.world, realBodyToAdd);
}

function calculateArea(vertices: any) {
  const n = vertices.length;
  let area = 0;

  for (let i = 0; i < n; i++) {
    const current = vertices[i];
    const next = vertices[(i + 1) % n];
    area += current.x * next.y - next.x * current.y;
  }

  area = Math.abs(area) / 2;
  return area;
}

function calculateLineArea(body: any) {
  let sum = 0;
  for (let i = 1; i < body.parts.length; i++) {
    const part = body.parts[i];
    const poly = verticesToGeometry(part);
    const cut = Cutter.intersection(poly, line);
    if (!cut) {
      continue;
    }
    sum += calculateArea(geoJsonToVectors(cut[0]));
  }
  playerScore += sum;
  return sum;
}








const Tetris: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLCanvasElement>(null);
  let block: Body | null = null;
  const blockRef = useRef<Body | null>(null); // 블록 참조 저장
  const hasCollidedRef = useRef(false);
  const currentBlockIdRef = useRef<number | null>(null); // 현재 떨어지는 블록의 id 참조 저장
  const [message, setMessage] = useState("");
  //const [playerScore, setPlayerScore] = useState(0);
  const [nowBlock, setNowBlock] = useState<Matter.Body | null>(null);

  let box: Block;
  let ground: Block;

  
  // 엔진 생성
  const engine = Engine.create({
    // 중력 설정
    gravity: {
      x: 0,
      y: 0.013,
    },
  });

  

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

          // if (leftAngleDelta > rightAngleDelta) {
          //   if (
          //     leftAngleDelta > 35 &&
          //     leftAngleInDegrees > prevLeftAngle &&
          //     leftWristX < prevLeftWristX-20
          //   ) {
          //     const block = blockRef.current;
          //     if (block) {
          //       // block이 존재하는지 확인
          //       Body.rotate(block, -Math.PI / 4); // 45도 회전
          //       setMessage("왼쪽으로 회전!"); // 메시지를 변경합니다.
          //       setTimeout(() => setMessage(""), 500);
          //     }
          //   }
          // } else {
          //   if (
          //     rightAngleDelta > 35 &&
          //     rightAngleInDegrees > prevRightAngle &&
          //     rightWristX-20 > prevRightWristX
          //   ) {
          //     const block = blockRef.current;
          //     if (block) {
          //       // block이 존재하는지 확인
          //       Body.rotate(block, Math.PI / 4); // 45도 회전
          //       setMessage("오른쪽으로 회전!");
          //       setTimeout(() => setMessage(""), 500);
          //     }
          //   }
          // }

          // let noseKeypoint = pose.keypoints.find(
          //   (keypoint) => keypoint.part === "nose"
          // );

          // // 각 요소가 존재하는지 확인하고, 존재한다면 위치 정보를 가져옵니다.
          // let noseX = noseKeypoint
          //   ? noseKeypoint.position.x
          //   : null;

          // let centerX = videoRef.current ? videoRef.current.offsetWidth / 2 : null;

          // if (noseX && centerX) {
          //   let forceMagnitude = Math.abs(noseX - centerX) / (centerX*100); // 중앙에서 얼마나 떨어져 있는지에 비례하는 힘의 크기를 계산합니다.
          //   forceMagnitude = Math.min(forceMagnitude, 1); // 힘의 크기가 너무 커지지 않도록 1로 제한합니다.

          //   let block = blockRef.current; // 현재 블록에 대한 참조를 얻습니다.

          //   if (block) {
          //     if (noseX < centerX) {
          //       // 코의 x 좌표가 캔버스 중앙보다 왼쪽에 있다면, 블록에 왼쪽으로 힘을 가합니다.
          //       Body.applyForce(block, block.position, { x: -forceMagnitude, y: 0 });
          //     } else {
          //       // 코의 x 좌표가 캔버스 중앙보다 오른쪽에 있다면, 블록에 오른쪽으로 힘을 가합니다.
          //       Body.applyForce(block, block.position, { x: forceMagnitude, y: 0 });
          //     }
          //   }
          // }

          prevLeftAngle = leftAngleInDegrees;
          prevRightAngle = rightAngleInDegrees;
          prevRightWristX = rightWristX;
          prevLeftWristX = leftWristX;
        }
      }, 250);
    }
    runPosenet();

    if (!sceneRef.current) return;
  
    // 렌더러 생성
    const app = new PIXI.Application({
      width: 600,
      height: 800,
      backgroundColor: 0x000000,
      view: sceneRef.current
      });
    // 엔진 실행
    const runner = Runner.create();
    Runner.run(runner, engine);

    // 바닥 생성
    const ground = Bodies.rectangle(300, 700, 610, 60, {
      isStatic: true,
      label: "Wall",
    });
    World.add(engine.world, ground);
    const groundGraphics = new PIXI.Graphics();
    groundGraphics.beginFill(0x8B4513); // 갈색으로 채우기 시작
    groundGraphics.drawRect(-305, -30, 610, 60); // 사각형 그리기
    groundGraphics.endFill(); // 채우기 종료
    groundGraphics.position.set(300, 700); // 위치 설정
    app.stage.addChild(groundGraphics); // 스테이지에 추가

    // 왼쪽 벽 생성
    const leftWall = Bodies.rectangle(100, 370, 60, 700, {
      isStatic: true,
      friction: 0,
      label: "Wall",
    });
    World.add(engine.world, leftWall);
    
    const leftWallGraphics = new PIXI.Graphics();
    leftWallGraphics.beginFill(0x8B4513); // 갈색으로 채우기 시작
    leftWallGraphics.drawRect(-30, -350, 60, 700); // 사각형 그리기
    leftWallGraphics.endFill(); // 채우기 종료
    leftWallGraphics.position.set(100, 370); // 위치 설정
    leftWallGraphics.pivot.set(0.5);  // 기준점을 중앙으로 설정
    app.stage.addChild(leftWallGraphics); // 스테이지에 추가

    // 오른쪽 벽 생성
    const rightWall = Bodies.rectangle(500, 370, 60, 700, {
      isStatic: true,
      friction: 0,
      label: "Wall",
    });
    World.add(engine.world, rightWall);
    
    const rightWallGraphics = new PIXI.Graphics();
    rightWallGraphics.beginFill(0x8B4513); // 갈색으로 채우기 시작
    rightWallGraphics.drawRect(-30, -350, 60, 700); // 사각형 그리기
    rightWallGraphics.endFill(); // 채우기 종료
    rightWallGraphics.position.set(500, 370); // 위치 설정
    rightWallGraphics.pivot.set(0.5);  // 기준점을 중앙으로 설정
    app.stage.addChild(rightWallGraphics); // 스테이지에 추가

    //  // Create a block
    //  block = createIBlock(200, 0);
    //  if (block.sprite) {
    //    app.stage.addChild(block.sprite);
    //  }
    //  World.add(engine.world, block);

    // app.ticker.add((delta) => {
    //   if (block && block.sprite) {
    //     block.sprite.rotation = block.angle;
    //     block.sprite.x = block.position.x;
    //     block.sprite.y = block.position.y;
    //   }
    //   Engine.update(engine, delta * (1000 / 60));
    // });
    

    // 일정 시간 간격으로 블록 생성
    const intervalId = setInterval(() => {
      hasCollidedRef.current = false;
      const createdSpot = (leftWall.position.x + rightWall.position.x) / 2;
      console.log(`createdSpot is ${createdSpot}`);
      const newBlock = createRandomBlock(createdSpot, nextBlockIndex); // nextBlockIndex 사용
      blockRef.current = newBlock; // 블록 참조 업데이트
      currentBlockIdRef.current = newBlock.id; // 블록 id 참조 업데이트

      setNowBlock(newBlock);



      World.add(engine.world, newBlock);

      if (newBlock.sprite) {
        app.stage.addChild(newBlock.sprite);
      }
      app.ticker.add((delta) => {
        // 물리 시뮬레이션 업데이트
        Engine.update(engine, delta * (1000 / 60));
      
        // 모든 본체에 대해
        for (var i = 0; i < engine.world.bodies.length; i++) {
          const body = engine.world.bodies[i];
      
          // 물리 본체와 연결된 스프라이트가 있다면
          if (body.sprite) {
            // 스프라이트의 위치와 회전을 물리 본체에 맞춤
            body.sprite.position.set(body.position.x, body.position.y);
            body.sprite.rotation = body.angle;
          }
        }
      });
      


      // 다음 블록
      nextBlockIndex = getRandomIndex(7);
    }, 5000);

    //충돌 이벤트 처리
    Events.on(engine, "collisionStart", (event) => {
      const pairs = event.pairs;
      
      for (let i = 0; i < pairs.length; i++) {
        const { bodyA, bodyB } = pairs[i];
        console.log(bodyA, bodyB);
        if (
          bodyA.parent.id === leftWall.id ||
          bodyB.parent.id === leftWall.id
        ) {
          return;
        }
        if (
          bodyA.parent.id === rightWall.id ||
          bodyB.parent.id === rightWall.id
        ) {
          return;
        }
        if (
          bodyA.parent.id === currentBlockIdRef.current ||
          bodyB.parent.id === currentBlockIdRef.current
        ) {
          hasCollidedRef.current = true;
        }
      }
    });

    const moveBlock = (event: KeyboardEvent) => {
      const block = blockRef.current;
      if (!block || hasCollidedRef.current) {
        return;
      }
      // 블록의 모든 점들의 x 좌표를 순회하여 가장 왼쪽과 오른쪽을 찾음
      const xValues = block.vertices.map((vertex) => vertex.x);
      const minX = Math.min(...xValues); // 가장 왼쪽 x 좌표
      const maxX = Math.max(...xValues); // 가장 오른쪽 x 좌표

      switch (event.key) {
        case "ArrowLeft":
          if (minX - blockSize <= leftWall.position.x + blockSize) {
            return;
          }
          Body.translate(block, { x: -blockSize, y: 0 });
          break;
        case "ArrowRight":
          if (maxX + blockSize >= rightWall.position.x - blockSize) {
            return;
          }
          Body.translate(block, { x: blockSize, y: 0 });
          break;

        case "ArrowDown":
          // 바닥으로 블록을 이동
          Body.applyForce(block, block.position, { x: 0, y: 0.05 });
          // 블록의 색상을 변경
          Body.set(block, "render.fillStyle", "#ff00ff");
          hasCollidedRef.current = true;
          break;
        case "z":
          if (
            minX - blockSize <= leftWall.position.x + blockSize ||
            maxX + blockSize >= rightWall.position.x - blockSize
          ) {
            return; // 벽에 가까이 있으면 회전하지 않음
          }
          Body.rotate(block, -Math.PI / 4);
          break;
        case "x":
          if (
            minX - blockSize <= leftWall.position.x + blockSize ||
            maxX + blockSize >= rightWall.position.x - blockSize
          ) {
            return; // 벽에 가까이 있으면 회전하지 않음
          }
          Body.rotate(block, Math.PI / 4);
          break;

        case "c":
          let bodies = Composite.allBodies(engine.world);
          // allBodies는 현재 엔진의 world에 있는 모든 물리적 객체를 포함하는 배열입니다.
          bodies.forEach((body) => {
            if (body.label === "Wall") {
              return;
            }
            removeLines(body); // 각 물리적 객체 정보 출력
            calculateLineArea(body);
          });
          break;

        default:
          break;
      }
    };

    // 키보드 이벤트 등록
    window.addEventListener("keydown", moveBlock);

    return () => {
      // 엔진 정지
      Engine.clear(engine);
      // 렌더러 정지
      Runner.stop(runner);
      // setInterval 제거
      clearInterval(intervalId);

      // 키보드 이벤트 제거
      window.removeEventListener("keydown", moveBlock);

      // Pixi.js 애플리케이션 정리
      app.destroy();
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
        <BlockInfo index={nextBlockIndex} />
      </div>
    </div>
  );
};

export default Tetris;
