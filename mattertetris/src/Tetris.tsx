import React, { useEffect, useRef, useState } from "react";
import {
  Engine,
  Render,
  Runner,
  Bodies,
  World,
  Body,
  Events,
  Composite,
} from "matter-js";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs";

const blockSize = 20;

// I 블록 생성 함수
const createIBlock = (x: number, y: number): Body => {
  const parts = [
    Bodies.rectangle(x, y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "red" },
    }),
    Bodies.rectangle(x, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "red" },
    }),
    Bodies.rectangle(x, y + 2 * blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "red" },
    }),
    Bodies.rectangle(x, y + 3 * blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "red" },
    }),
  ];

  return Body.create({ parts: parts });
};

// O 블록 생성 함수
const createOBlock = (x: number, y: number): Body => {
  const parts = [
    Bodies.rectangle(x, y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "yellow" },
    }),
    Bodies.rectangle(x + blockSize, y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "yellow" },
    }),
    Bodies.rectangle(x, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "yellow" },
    }),
    Bodies.rectangle(x + blockSize, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "yellow" },
    }),
  ];

  return Body.create({ parts: parts });
};

// T 블록 생성 함수
const createTBlock = (x: number, y: number): Body => {
  const parts = [
    Bodies.rectangle(x, y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "purple" },
    }),
    Bodies.rectangle(x - blockSize, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "purple" },
    }),
    Bodies.rectangle(x, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "purple" },
    }),
    Bodies.rectangle(x + blockSize, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "purple" },
    }),
  ];

  return Body.create({ parts: parts });
};

// S 블록 생성 함수
const createSBlock = (x: number, y: number) => {
  const parts = [
    Bodies.rectangle(x, y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "green" },
    }),
    Bodies.rectangle(x + blockSize, y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "green" },
    }),
    Bodies.rectangle(x - blockSize, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "green" },
    }),
    Bodies.rectangle(x, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "green" },
    }),
  ];

  return Body.create({ parts: parts });
};

// Z 블록 생성 함수
const createZBlock = (x: number, y: number) => {
  const parts = [
    Bodies.rectangle(x, y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "teal" },
    }),
    Bodies.rectangle(x - blockSize, y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "teal" },
    }),
    Bodies.rectangle(x, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "teal" },
    }),
    Bodies.rectangle(x + blockSize, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "teal" },
    }),
  ];

  return Body.create({ parts: parts });
};

// J 블록 생성 함수
const createJBlock = (x: number, y: number) => {
  const parts = [
    Bodies.rectangle(x, y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "blue" },
    }),
    Bodies.rectangle(x, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "blue" },
    }),
    Bodies.rectangle(x, y + 2 * blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "blue" },
    }),
    Bodies.rectangle(x - blockSize, y + 2 * blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "blue" },
    }),
  ];

  return Body.create({ parts: parts });
};

// L 블록 생성 함수
const createLBlock = (x: number, y: number) => {
  const parts = [
    Bodies.rectangle(x, y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "orange" },
    }),
    Bodies.rectangle(x, y + blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "orange" },
    }),
    Bodies.rectangle(x, y + 2 * blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "orange" },
    }),
    Bodies.rectangle(x + blockSize, y + 2 * blockSize, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
      render: { fillStyle: "orange" },
    }),
  ];

  return Body.create({ parts: parts });
};

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
function createRandomBlock(x: number, randomIndex: number) {
  const createBlock = blockCreators[randomIndex];
  return createBlock(x, 0); // 화면의 중앙 상단에서 블록 생성
}



const Tetris: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<HTMLDivElement>(null); 
  let block: Body | null = null;
  const blockRef = useRef<Body | null>(null); // 블록 참조 저장
  const hasCollidedRef = useRef(false);
  const currentBlockIdRef = useRef<number | null>(null); // 현재 떨어지는 블록의 id 참조 저장
  const [message, setMessage] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [nextBlock, setNextBlock] = useState<Matter.Body | null>(null);

  

  // 엔진 생성
  const engine = Engine.create({
    // 중력 설정
    gravity: {
      x: 0,
      y: 0.13,
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
              keypoint.score >= 0.2 &&
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


          // let leftShoulderKeypoint = pose.keypoints.find(
          //   (keypoint) => keypoint.part === "leftShoulder"
          // );
          // let leftElbowKeypoint = pose.keypoints.find(
          //   (keypoint) => keypoint.part === "leftElbow"
          // );
          // let leftWristKeypoint = pose.keypoints.find(
          //   (keypoint) => keypoint.part === "leftWrist"
          // );

          // // 각 요소가 존재하는지 확인하고, 존재한다면 위치 정보를 가져옵니다.
          // let leftShoulder = leftShoulderKeypoint
          //   ? leftShoulderKeypoint.position
          //   : null;
          // let leftElbow = leftElbowKeypoint ? leftElbowKeypoint.position : null;
          // let leftWrist = leftWristKeypoint ? leftWristKeypoint.position : null;

          // if (leftShoulder && leftElbow && leftWrist) {
          //   let vectorA = {
          //     x: leftShoulder.x - leftElbow.x,
          //     y: leftShoulder.y - leftElbow.y,
          //   };
          //   let vectorB = {
          //     x: leftWrist.x - leftElbow.x,
          //     y: leftWrist.y - leftElbow.y,
          //   };

          //   let leftDotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
          //   let leftMagnitudeA = Math.sqrt(
          //     vectorA.x * vectorA.x + vectorA.y * vectorA.y
          //   );
          //   let leftMagnitudeB = Math.sqrt(
          //     vectorB.x * vectorB.x + vectorB.y * vectorB.y
          //   );

          //   let leftAngleInRadians = Math.acos(
          //     leftDotProduct / (leftMagnitudeA * leftMagnitudeB)
          //   );
          //   leftAngleInDegrees = leftAngleInRadians * (180 / Math.PI);
            
          //   leftWristX = leftWrist.x;
          //   leftAngleDelta = leftAngleInDegrees - prevLeftAngle;
          // }

          // let rightShoulderKeypoint = pose.keypoints.find(
          //   (keypoint: any) => keypoint.part === "rightShoulder"
          // );
          // let rightElbowKeypoint = pose.keypoints.find(
          //   (keypoint: any) => keypoint.part === "rightElbow"
          // );
          // let rightWristKeypoint = pose.keypoints.find(
          //   (keypoint: any) => keypoint.part === "rightWrist"
          // );

          // // 각 요소가 존재하는지 확인하고, 존재한다면 위치 정보를 가져옵니다.
          // let rightShoulder = rightShoulderKeypoint
          //   ? rightShoulderKeypoint.position
          //   : null;
          // let rightElbow = rightElbowKeypoint
          //   ? rightElbowKeypoint.position
          //   : null;
          // let rightWrist = rightWristKeypoint
          //   ? rightWristKeypoint.position
          //   : null;

          // if (rightShoulder && rightElbow && rightWrist) {
          //   let vectorA = {
          //     x: rightShoulder.x - rightElbow.x,
          //     y: rightShoulder.y - rightElbow.y,
          //   };
          //   let vectorB = {
          //     x: rightWrist.x - rightElbow.x,
          //     y: rightWrist.y - rightElbow.y,
          //   };

          //   let rightDotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
          //   let rightMagnitudeA = Math.sqrt(
          //     vectorA.x * vectorA.x + vectorA.y * vectorA.y
          //   );
          //   let rightMagnitudeB = Math.sqrt(
          //     vectorB.x * vectorB.x + vectorB.y * vectorB.y
          //   );

          //   let rightAngleInRadians = Math.acos(
          //     rightDotProduct / (rightMagnitudeA * rightMagnitudeB)
          //   );
          //   rightAngleInDegrees = rightAngleInRadians * (180 / Math.PI);

          //   rightWristX = rightWrist.x;
          //   // 각도의 변화값. (이전 각도와의 차이)
          //   rightAngleDelta = rightAngleInDegrees - prevRightAngle;
          // }

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
          

          // prevLeftAngle = leftAngleInDegrees;
          // prevRightAngle = rightAngleInDegrees;
          // prevRightWristX = rightWristX;
          // prevLeftWristX = leftWristX;
        }
      }, 250);
    }
    runPosenet();

    if (!sceneRef.current) return;

    // 렌더러 생성
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 600,
        height: 800,
        wireframes: false,
    background: '#000000' 
      },
    });

    // 렌더러 시작
    Render.run(render);

    // 엔진 실행
    const runner = Runner.create();
    Runner.run(runner, engine);

    // 바닥 생성
    const ground = Bodies.rectangle(300, 700, 610, 60, { isStatic: true });
    World.add(engine.world, ground);

    // 왼쪽 벽 생성
    const leftWall = Bodies.rectangle(100, 370, 60, 700, { isStatic: true, friction: 0 });
    World.add(engine.world, leftWall);

    // 오른쪽 벽 생성
    const rightWall = Bodies.rectangle(500, 370, 60, 700, { isStatic: true, friction: 0 });
    World.add(engine.world, rightWall);



    // 일정 시간 간격으로 블록 생성
    const intervalId = setInterval(() => {
      const createdSpot = (leftWall.position.x + rightWall.position.x) / 2;
      
      if (!nextBlock) {
        const randomNum = getRandomIndex(7);
        setNextBlock(createRandomBlock(createdSpot, randomNum));
      }
      const randomNum = getRandomIndex(7);
      const newBlock = createRandomBlock(createdSpot, randomNum);
      blockRef.current = newBlock; // 블록 참조 업데이트
      currentBlockIdRef.current = newBlock.id; // 블록 id 참조 업데이트

      hasCollidedRef.current = false;
      World.add(engine.world, newBlock);
    }, 3000);

    // 충돌 이벤트 처리
    Events.on(engine, "collisionStart", (event) => {
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const { bodyA, bodyB } = pairs[i];

        if (bodyA.parent.id === leftWall.id || bodyB.parent.id === leftWall.id) {
          return;
        }
        if (bodyA.parent.id === rightWall.id || bodyB.parent.id === rightWall.id) {
          return;
        }
        if (
          bodyA.parent.id === currentBlockIdRef.current ||
          bodyB.parent.id === currentBlockIdRef.current
        ) {
          hasCollidedRef.current = true;
        }
      }

      if (hasCollidedRef.current) {
        hasCollidedRef.current = false;
 
      // 한 줄이 80% 이상 차면 그 줄을 없애는 코드
      const rowAreaCounts: { [key: number]: number } = {};
      const bodies = Composite.allBodies(engine.world);

      bodies.forEach((body) => {
        const row = Math.floor(body.position.y / blockSize);
        if (!rowAreaCounts[row]) {
          rowAreaCounts[row] = 0;
        }
        rowAreaCounts[row] += body.bounds.max.y - body.bounds.min.y; // 블록의 높이(면적)를 더한다.
      });

      const originalBackgroundColor = render.options.background;  // 원래의 배경색 저장
      
      Object.entries(rowAreaCounts).forEach(([row, area]) => {
        if (area >= 0.5 * blockSize * 10) {
          bodies.forEach((body) => {
            if (Math.floor(body.position.y / blockSize) === parseInt(row) && !body.isStatic) {
              // 블록의 렌더링 옵션 변경
              body.render.fillStyle = 'red';  // 채우기 색상을 빨간색으로
      
              Render.world(render);  // 렌더러 다시 그리기
      
              setTimeout(() => {
                World.remove(engine.world, body, true);
                setPlayerScore((prevPlayerScore) => prevPlayerScore + 100);
                // 배경색 변경
                render.options.background = 'rgba(255, 255, 255, 0.5)';
                Render.world(render);  // 렌더러 다시 그리기
      
                setTimeout(() => {
                  // 배경색 초기화
                  render.options.background = originalBackgroundColor;
                  Render.world(render);  // 렌더러 다시 그리기
                  //setMessage("블록지우기 실행!");
      
                  // 0.5초 후에 메시지 지우기
                  setTimeout(() => setMessage(""), 500);
                }, 500);
              }, 500);
            }
          });
        }
      });
      
      
      
    }
    });

    const moveBlock = (event: KeyboardEvent) => {
      const block = blockRef.current;
    
      if (!block || hasCollidedRef.current) {
        return;
      }
      // 블록의 모든 점들의 x 좌표를 순회하여 가장 왼쪽과 오른쪽을 찾음
      const xValues = block.vertices.map(vertex => vertex.x);
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
        case "z":
          if (minX - blockSize <= leftWall.position.x + blockSize || maxX + blockSize >= rightWall.position.x - blockSize) {
            return; // 벽에 가까이 있으면 회전하지 않음
          }
          Body.rotate(block, Math.PI / 4);
          break;
        case "x":
          if (minX - blockSize <= leftWall.position.x + blockSize || maxX + blockSize >= rightWall.position.x - blockSize) {
            return; // 벽에 가까이 있으면 회전하지 않음
          }
          Body.rotate(block, -Math.PI / 4);
          break;
        default:
          break;
      }
    };
    
    
    

    // 키보드 이벤트 등록
    window.addEventListener("keydown", moveBlock);

    return () => {
      render.canvas.remove();
      // 클린업 함수
      // 엔진 정지
      Engine.clear(engine);
      // 렌더러 정지
      Render.stop(render);
      // Runner 정지
      Runner.stop(runner);
      // setInterval 제거
      clearInterval(intervalId);

      // 키보드 이벤트 제거
      window.removeEventListener("keydown", moveBlock);
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
      <div
        ref={sceneRef}
        style={{
          width: "600px",
          height: "800px",
          marginRight: "150px",
          position: "relative"
        }}
      >
        {" "}
        {/* position 속성을 추가합니다. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "30%",
            color: "white",
            background: "rgba(0,0,0,0.5)",
            padding: "10px",
            fontSize: "48px"  // 글씨 크기를 24px로 설정
          }}
        >
          {message}
          점수: {playerScore}
        </div>{" "}
        {/* 메시지를 표시하는 div를 추가하고, 위치를 조정합니다. */}
      </div>
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
