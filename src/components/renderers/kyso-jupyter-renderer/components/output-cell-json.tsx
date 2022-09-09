import React from 'react';
import RenderCode from '../../RenderCode';

interface Props {
  output: Object;
}

const OutputCellJSON = ({ output }: Props) => {
  return <RenderCode code={JSON.stringify(output, null, 2)} />;
};

export default OutputCellJSON;
