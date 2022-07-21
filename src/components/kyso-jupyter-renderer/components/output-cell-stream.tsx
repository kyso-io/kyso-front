import React from 'react';

interface Props {
  outputs: string[];
}

const OutputCellStream = ({ outputs }: Props) => {
  return (
    <div className="my-1">
      <pre className="mb-0">{outputs.map((o: string) => o)}</pre>
    </div>
  );
};

export default OutputCellStream;
