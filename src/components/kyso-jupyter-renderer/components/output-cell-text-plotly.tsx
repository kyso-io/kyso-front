/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Props {
  outputs: any[];
}

const OutputCellPlotly = ({ outputs }: Props) => {
  return (
    <React.Fragment>
      {outputs.map((output: any, index: number) => (
        <Plot key={index} data={output.data} layout={output.layout} config={output.config} />
      ))}
    </React.Fragment>
  );
};

export default OutputCellPlotly;
