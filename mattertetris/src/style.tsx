import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    justifyContent: center;
    alignItems: center;
    height: 100vh;
    overflow: hidden;
`;

export const SceneCanvas = styled.div`
    width: 600px;
    height: 800px;
    left: 200px;
    position: absolute;
`;

export const EffectCanvas = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
`;



export const VideoContainer = styled.div`
  top: 250px;
  left: 0%;
  position: relative;
  width: 480px;
  height: 320px;
  border: 2px solid black;
`;

export const Video = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  transform: scaleX(-1);
  width: 480px;
  height: 320px;
`;

export const VideoCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 480px;
  height: 320px;
`;
