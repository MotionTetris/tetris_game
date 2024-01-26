// BlockInfo.tsx
import React from 'react';

interface BlockInfoProps {
  index: number;
}
const BlockInfo: React.FC<BlockInfoProps> = ({ index }) => {
  // 블록의 형상을 텍스트로 표현합니다. 실제 블록의 형상에 따라서 이 배열을 수정하세요.
  const blockShapes = [    '####',    '##\n##',    ' # \n###',    ' ##\n##',    '##\n ##',    ' #\n #\n##',    '#\n#\n##',  ];

  // 각 블록 형태에 해당하는 색상을 저장하는 배열입니다.
  const blockColors = ['red', 'yellow', 'purple', 'green', 'teal', 'blue', 'orange'  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        color: "black",
        background: blockColors[index],  // 각 블록 형태에 해당하는 색상으로 배경 색상을 설정합니다.
        padding: "10px",
        fontSize: "24px"
      }}
    >
      <pre style={{ fontFamily: 'monospace' }}> 
        {blockShapes[index]}
      </pre>
    </div>
  );
};


export default BlockInfo;
