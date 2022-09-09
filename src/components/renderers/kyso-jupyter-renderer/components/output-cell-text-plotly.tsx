import dynamic from 'next/dynamic';
import React from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Props {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  outputs: any[];
}

const OutputCellPlotly = ({ outputs }: Props) => {
  return (
    <React.Fragment>
      {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        outputs.map((output: any, index: number) => (
          <Plot key={index} data={output.data} layout={output.layout} config={output.config} />
        ))
      }
    </React.Fragment>
  );
};

export default OutputCellPlotly;
