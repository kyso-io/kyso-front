import React from 'react';

interface Props {
  outputs: string[];
}

const OutputCellTextPlain = ({ outputs }: Props) => {
  // return (
  //   <div>
  //     {outputs.map((o: string) => (
  //       <div>{o}</div>
  //     ))}
  //   </div>
  // );
  return (
    <div className="my-1">
      <pre className="mb-0">{outputs.map((o: string) => o)}</pre>
    </div>
  );
};

export default OutputCellTextPlain;
