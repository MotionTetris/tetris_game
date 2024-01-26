import { Body, Bodies } from 'matter-js';


export const blockSize = 20;

// I 블록 생성 함수
export const createIBlock = (x: number, y: number): Body => {
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
export const createOBlock = (x: number, y: number): Body => {
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
export const createTBlock = (x: number, y: number): Body => {
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
export const createSBlock = (x: number, y: number) => {
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
export const createZBlock = (x: number, y: number) => {
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
export const createJBlock = (x: number, y: number) => {
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
export const createLBlock = (x: number, y: number) => {
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