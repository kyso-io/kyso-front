import { KysoCodeRenderer } from '@/components/kyso-code-renderer';
import React from 'react';

interface Props {
  output: Object;
}

const OutputCellJSON = ({ output }: Props) => {
  return (
    <div className="my-1">
      <KysoCodeRenderer code={JSON.stringify(output, null, 2)}></KysoCodeRenderer>
    </div>
  );
};

export default OutputCellJSON;
