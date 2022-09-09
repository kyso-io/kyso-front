import React from 'react';

interface Props {
  output: string;
}

const OutputCellImage = ({ output }: Props) => {
  return (
    <div className="my-1">
      <img className="w-100" src={`data:image/png;base64, ${output}`} alt="output" />
    </div>
  );
};

export default OutputCellImage;
