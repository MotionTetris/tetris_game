import { Body, Bodies } from 'matter-js';
import * as PIXI from 'pixi.js';

interface Block extends Body {
  sprite?: PIXI.Sprite;
}

export const blockSize = 20;
export const createIBlock = (x: number, y: number): Block => {
  const blockSize = 20; // 블록 크기
  
  const parts = [];
  const sprites = [];
  
  const positions = [
    {x: x, y: y},
    {x: x, y: y + blockSize},
    {x: x, y: y + 2 * blockSize},
    {x: x, y: y + 3 * blockSize},
  ];

  positions.reverse().forEach((position) => {
    // Matter.js에서 블록 생성
    const part = Bodies.rectangle(position.x, position.y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
    });
    parts.push(part);
    
    // Pixi.js에서 스프라이트 생성
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.tint = "red"; 
    sprite.width = blockSize;
    sprite.height = blockSize;
    sprite.anchor.set(0.5, 0.5); // 중심점을 기준으로 위치 설정
    sprite.x = position.x;
    sprite.y = position.y;
    sprites.push(sprite);
  });

  // 블록들을 합쳐서 복합체 생성
  const block = Body.create({ parts: parts }) as Block;
  
  // 스프라이트들을 Container에 추가
  const container = new PIXI.Container();
  sprites.forEach((sprite) => {
    container.addChild(sprite);
  });

  block.sprite = container;
  
  return block;
};

// O 블록 생성 함수
export const createOBlock = (x: number, y: number): Block => {
  const blockSize = 20; // 블록 크기
  
  const parts = [];
  const sprites = [];
  
  const positions = [
    {x: x, y: y},
    {x: x + blockSize, y: y},
    {x: x, y: y + blockSize},
    {x: x + blockSize, y: y + blockSize},
  ];

  positions.forEach((position) => {
    // Matter.js에서 블록 생성
    const part = Bodies.rectangle(position.x, position.y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
    });
    parts.push(part);
    
    // Pixi.js에서 스프라이트 생성
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.tint = 0xFFFF00; // Yellow
    sprite.width = blockSize;
    sprite.height = blockSize;
    sprite.anchor.set(0.5, 0.5); // 중심점을 기준으로 위치 설정
    sprite.x = position.x;
    sprite.y = position.y;
    sprites.push(sprite);
  });

  // 블록들을 합쳐서 복합체 생성
  const block = Body.create({ parts: parts }) as Block;
  
  // 스프라이트들을 Container에 추가
  const container = new PIXI.Container();
  sprites.forEach((sprite) => {
    container.addChild(sprite);
  });

  block.sprite = container;
  
  return block;
};

// T 블록 생성 함수
export const createTBlock = (x: number, y: number): Block => {
  const blockSize = 20; // 블록 크기
  
  const parts = [];
  const sprites = [];
  
  const positions = [
    {x: x, y: y},
    {x: x - blockSize, y: y + blockSize},
    {x: x, y: y + blockSize},
    {x: x + blockSize, y: y + blockSize},
  ];

  positions.forEach((position) => {
    // Matter.js에서 블록 생성
    const part = Bodies.rectangle(position.x, position.y, blockSize, blockSize, {
      friction: 0.1,
      restitution: 0.3,
    });
    parts.push(part);
    
    // Pixi.js에서 스프라이트 생성
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.tint = 0x800080; // Purple
    sprite.width = blockSize;
    sprite.height = blockSize;
    sprite.anchor.set(0.5, 0.5); // 중심점을 기준으로 위치 설정
    sprite.x = position.x;
    sprite.y = position.y;
    sprites.push(sprite);
  });

  // 블록들을 합쳐서 복합체 생성
  const block = Body.create({ parts: parts }) as Block;
  
  // 스프라이트들을 Container에 추가
  const container = new PIXI.Container();
  sprites.forEach((sprite) => {
    container.addChild(sprite);
  });

  block.sprite = container;
  
  return block;
};



// S 블록 생성 함수
export const createSBlock = (x: number, y: number): Block => {
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

  const block = Body.create({ parts: parts }) as Block;
  const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  sprite.tint = 0x008000; // Green
  sprite.width = blockSize * 3;
  sprite.height = blockSize * 2;
  sprite.anchor.set(0.5, 0.5);
  sprite.x = x;
  sprite.y = y + blockSize;
  block.sprite = sprite;

  return block;
};

// Z 블록 생성 함수
export const createZBlock = (x: number, y: number): Block => {
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

  const block = Body.create({ parts: parts }) as Block;
  const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  sprite.tint = 0x008080; // Teal
  sprite.width = blockSize * 3;
  sprite.height = blockSize * 2;
  sprite.anchor.set(0.5, 0.5);
  sprite.x = x;
  sprite.y = y + blockSize;
  block.sprite = sprite;

  return block;
};

// J 블록 생성 함수
export const createJBlock = (x: number, y: number): Block => {
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

  const block = Body.create({ parts: parts }) as Block;
  const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  sprite.tint = 0x0000FF; // Blue
  sprite.width = blockSize * 2;
  sprite.height = blockSize * 3;
  sprite.anchor.set(0.5, 0.5);
  sprite.x = x - blockSize / 2;
  sprite.y = y + blockSize;
  block.sprite = sprite;

  return block;
};

// L 블록 생성 함수
export const createLBlock = (x: number, y: number): Block => {
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

  const block = Body.create({ parts: parts }) as Block;
  const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  sprite.tint = 0xFFA500; // Orange
  sprite.width = blockSize * 2;
  sprite.height = blockSize * 3;
  sprite.anchor.set(0.5, 0.5);
  sprite.x = x + blockSize / 2;
  sprite.y = y + blockSize;
  block.sprite = sprite;

  return block;
};
