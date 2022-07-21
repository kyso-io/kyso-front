import { KysoCodeRenderer } from '@/components/kyso-code-renderer';
import React from 'react';

interface Props {
  outputs: string[];
}

const OutputCellError = ({ outputs }: Props) => {
  return (
    <div className="my-1">
      <KysoCodeRenderer code={outputs.map((element: string) => element.replace(/[\n\r\t\s]+/g, ' ')).join('\n')}></KysoCodeRenderer>
    </div>
  );
};

export default OutputCellError;
