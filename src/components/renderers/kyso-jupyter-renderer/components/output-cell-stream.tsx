import React from 'react';
import RenderCode from '../../RenderCode';

interface Props {
  outputs: string[];
}

const OutputCellStream = ({ outputs }: Props) => {
  return <RenderCode code={outputs.join(`\n`)} />;
};

export default OutputCellStream;
