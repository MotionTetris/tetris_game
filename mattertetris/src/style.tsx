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
    marginRight: 150px;
    position: relative;
`;

export const EffectCanvas = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
`;