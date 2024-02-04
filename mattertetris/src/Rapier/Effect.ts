import * as PIXI from "pixi.js";
import {Viewport} from "pixi-viewport";
// 폭발 효과 함수 (정사각형 흩어지는 효과)
export const explodeParticleEffect = (app: PIXI.Application, effect: PIXI.ParticleContainer,x: number, y: number) => {
  // 100개의 입자를 생성
    for (let i = 0; i < 100; i++) {
      // 각 입자는 작은 흰색 사각형으로 표현
        const effectParticle = new PIXI.Sprite(PIXI.Texture.WHITE);
        effectParticle.tint = 0xff0000; // 입자 색상 설정
        effectParticle.width = effectParticle.height = Math.random() * 5 + 5; // 입자 크기 설정

        // 파티클의 위치를 라인의 직사각형 범위 내로 설정
        effectParticle.x = x + Math.random() * 320;
        effectParticle.y = y + Math.random() * 32;

        // 각 입자는 무작위 방향으로 이동
        effectParticle.vx = Math.random() * 5 - 2.5;
        effectParticle.vy = Math.random() * 5 - 2.5;

        // 입자를 ParticleContainer에 추가
        effect.addChild(effectParticle);
    }
    const moveEffectParticles = () => {
        for (let i = effect.children.length - 1; i >= 0; i--) {
            const effectParticle = effect.children[i] as PIXI.Sprite;
            effectParticle.x += effectParticle.vx;
            effectParticle.y += effectParticle.vy;
            effectParticle.alpha -= 0.01;
            effectParticle.scale.x = effectParticle.scale.y += 0.01;

            // 입자가 완전히 투명해지면 ParticleContainer에서 제거
            if (effectParticle.alpha <= 0) {
                effect.removeChild(effectParticle);
            }
        }

        // 모든 입자가 제거되면 ticker에서 이 함수를 제거
        if (effect.children.length === 0) {
            app.ticker.remove(moveEffectParticles);
        }
    };

    app.ticker.add(moveEffectParticles);
};

export function explodeImageEffect(
  explosionSprite: PIXI.DisplayObject, 
  app: PIXI.Application, 
  i: number
): void {
  explosionSprite.alpha = 1; // 알파값 초기화

  // 스프라이트가 이미 부모에 추가되어 있으면 제거
  if (explosionSprite.parent) { 
      explosionSprite.parent.removeChild(explosionSprite);
  }

  // 스프라이트 위치 설정 및 추가
  explosionSprite.x = 140;
  explosionSprite.y = i * 32 - 200;
  explosionSprite.alpha = 0.5;
  app.stage.addChild(explosionSprite);


  let ticker = PIXI.Ticker.shared;
          let timeElapsed = 0; // 경과 시간
          const handleTick = (deltaTime: number) => {
            timeElapsed += deltaTime;
            if (timeElapsed >= 60) { // 약 1초 후
              ticker.remove(handleTick); // 애니메이션 제거
              if (explosionSprite.parent) { // 스프라이트가 부모에 추가되어 있다면 제거
                explosionSprite.parent.removeChild(explosionSprite);
              }
            }
          };
          ticker.add(handleTick);
}



export function collisionParticleEffect(
    x: number,
    y: number, 
    viewport: Viewport,
    renderer: PIXI.Renderer
  ): void {
    for (let i = 0; i < 30; i++) {
  
        const particle = generateParticleTexture(renderer);
  
        particle.position.set(
          x, y
        ); // 파티클 위치
  
        particle.speed = Math.random() * 5; // 파티클 속도
        particle.direction = Math.random() * Math.PI * 2; // 파티클 방향
        particle.alpha = 1; // 파티클 초기 투명도
        viewport.addChild(particle);
  
        // 파티클 움직임과 소멸
        let ticker = new PIXI.Ticker();
        ticker.add(() => {
          particle.x += Math.cos(particle.direction) * particle.speed;
          particle.y += Math.sin(particle.direction) * particle.speed;
          particle.alpha -= 0.01; // 점차 투명도 감소
          if (particle.alpha <= 0) {
            // 투명도가 0이 되면 파티클 제거
            viewport.removeChild(particle);
            ticker.stop();
          }
        });
        ticker.start();
    }
  }
  

  export function generateParticleTexture(renderer: PIXI.Renderer): PIXI.Sprite {
    const radius = 5;
    const particleGraphics = new PIXI.Graphics();
    particleGraphics.beginFill(0xffb6c1);
    particleGraphics.drawCircle(radius, radius, radius); // 원의 중심 좌표를 (radius, radius)로 이동
    particleGraphics.endFill();
  
    const renderTexture = PIXI.RenderTexture.create({
      width: radius * 2, // 원의 직경만큼 너비를 설정
      height: radius * 2 // 원의 직경만큼 높이를 설정
    });
    renderer.render(particleGraphics, { renderTexture });
  
    const particleSprite = new PIXI.Sprite(renderTexture);
    return particleSprite;
  }
  
  


export function createRectangle(app: PIXI.Application, width: number, height: number, x: number, y: number) {
    const rectangle = new PIXI.Graphics();
    rectangle.beginFill(0x000000);
    rectangle.drawRect(0, 0, width, height);
    rectangle.endFill();
    rectangle.x = x;
    rectangle.y = y;
    app.stage.addChild(rectangle);
    return rectangle;
}


export function performRotateEffect(rectangle: PIXI.Graphics, app: PIXI.Application, color: number) {
    rectangle.clear();
    rectangle.beginFill(color);
    rectangle.drawRect(0, 0, 50, 400);
    rectangle.endFill();
  
    let direction = 1;
    const effectDuration = 0.5; // 효과 지속 시간(초)
    const startTime = Date.now(); // 시작 시간
  
    const animate = () => {
      rectangle.alpha += 0.01 * direction;
      if (rectangle.alpha > 1) {
        rectangle.alpha = 1;
        direction = -1;
      } else if (rectangle.alpha < 0) {
        rectangle.alpha = 0;
        direction = 1;
      }
  
      // 효과 지속 시간이 지나면 ticker에서 콜백 함수를 제거
      if ((Date.now() - startTime) / 1000 > effectDuration) {
        app.ticker.remove(animate);
  
        // 효과가 끝나면 채우기 색상을 다시 검정색으로 변경
        rectangle.clear();
        rectangle.beginFill(0x000000);
        rectangle.drawRect(0, 0, 50, 400);
        rectangle.endFill();
      }
    };
  
    // 티커에 애니메이션 함수 추가
    app.ticker.add(animate);
  }
  
  
  export function performPushEffect(firstRectangle: PIXI.Graphics, secondRectangle: PIXI.Graphics, alpha: number, color: number) {
    firstRectangle.alpha = alpha;
    firstRectangle.clear();
    firstRectangle.beginFill(color);
    firstRectangle.drawRect(0, 0,50, 400);
    firstRectangle.endFill();
  
    secondRectangle.clear();
    secondRectangle.beginFill(0x000000);
    secondRectangle.drawRect(0, 0, 50, 400);
    secondRectangle.endFill();
  }




  export function createLineEffect(i: number, viewport: Viewport, lines: PIXI.Graphics[]): void {
    let line = new PIXI.Graphics();
    line.lineStyle(1, 0xFFF000, 0.2); // 선의 두께는 1, 색상은 검정색, 투명도는 1(불투명)
    line.beginFill(0x000000, 0); 
    line.drawRect(100, i * 32 - 20, 420, 32); // 32픽셀 간격으로 높이를 설정
    line.endFill();
    lines.push(line); // lines 배열에 추가
    viewport.addChild(line); // stage에 추가
}