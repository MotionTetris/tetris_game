import { useRef, useEffect } from 'react';
import * as posenet from '@tensorflow-models/posenet';
import '@tensorflow/tfjs';

function Webcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function setupWebcam() {
        const video = document.createElement('video');
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
      const ctx = canvas?.getContext('2d');

      setInterval(async () => {
        const pose = await net.estimateSinglePose(video, {
          flipHorizontal: true
        });

        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          pose.keypoints.forEach(keypoint => {
            if (keypoint.score >= 0.2 && ['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist'].includes(keypoint.part)) {
              ctx.beginPath();
              ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = 'red';
              ctx.fill();
            }
            else if (keypoint.part === 'nose') {
                ctx.beginPath();
                ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.fill();
            }
          });
        }
      }, 10);
    }

    runPosenet();
  }, []);

  return (
    <div style={{ position: 'relative', width: 640, height: 480 }}>
      <video ref={videoRef} autoPlay style={{ position: 'absolute', top: 0, left: 0, transform: 'scaleX(-1)' }} width="640" height="480" />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} width="640" height="480" />
    </div>
  );
  
  
}

export default Webcam;
