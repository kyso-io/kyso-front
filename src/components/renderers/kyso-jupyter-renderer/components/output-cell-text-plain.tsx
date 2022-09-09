import React from 'react';
import RenderCode from '../../RenderCode';

interface Props {
  outputs: string[];
}

const OutputCellTextPlain = ({ outputs }: Props) => {
  return <RenderCode code={outputs.join(`\n`)} />;
};

export default OutputCellTextPlain;
