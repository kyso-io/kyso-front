import React from 'react';
import RenderCode from '../../RenderCode';

interface Props {
  outputs: string[];
}

const OutputCellError = ({ outputs }: Props) => {
  return <RenderCode code={outputs.map((element: string) => element.replace(/[\n\r\t\s]+/g, ' ')).join('\n')} />;
};

export default OutputCellError;
