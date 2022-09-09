import React from 'react';
import type { DataType } from '../interfaces/data-type';
import type { Output } from '../interfaces/jupyter-notebook';
import OutputCellError from './output-cell-error';
import OutputCellImage from './output-cell-image';
import OutputCellJSON from './output-cell-json';
import OutputCellStream from './output-cell-stream';
import OutputCellHtml from './output-cell-text-html';
import OutputCellTextPlain from './output-cell-text-plain';
import OutputCellPlotly from './output-cell-text-plotly';

interface Props {
  showOutput: boolean;
  output: Output;
}

const OutputCell = ({ showOutput, output }: Props) => {
  let dataTypes: DataType[] = [];

  if (output?.data) {
    for (const type in output.data) {
      /* eslint-disable no-prototype-builtins */
      if (output.data.hasOwnProperty(type)) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const outputs: any = output.data[type];
        dataTypes.push({
          type,
          outputs: Array.isArray(outputs) ? outputs : [outputs],
        });
      }
    }
  }
  if (output?.name) {
    dataTypes.push({
      type: output.output_type,
      outputs: output.text!,
    });
  }
  if (output?.ename) {
    dataTypes.push({
      type: output.output_type,
      outputs: [output.evalue!],
    });
  }

  const plotlyOutput: DataType | undefined = dataTypes.find((d: DataType) => d.type === 'application/vnd.plotly.v1+json');

  if (plotlyOutput) {
    dataTypes = [plotlyOutput];
  }

  return (
    <React.Fragment>
      {dataTypes.map((data: DataType, index: number) => {
        if (showOutput && data.type === 'text/plain') {
          return <OutputCellTextPlain key={index} outputs={data.outputs} />;
        }
        if (data.type === 'image/png') {
          return <OutputCellImage key={index} output={Array.isArray(data.outputs) ? data.outputs[0] : data.outputs} />;
        }
        if (data.type === 'stream') {
          return <OutputCellStream key={index} outputs={data.outputs} />;
        }
        if (showOutput && data.type === 'application/json') {
          return <OutputCellJSON key={index} output={data.outputs[0]} />;
        }
        if (showOutput && data.type === 'error') {
          return <OutputCellError key={index} outputs={data.outputs} />;
        }
        if (data.type === 'text/html') {
          return <OutputCellHtml key={index} outputs={data.outputs} />;
        }
        if (data.type === 'application/vnd.plotly.v1+json') {
          return <OutputCellPlotly key={index} outputs={data.outputs} />;
        }
        if (showOutput) {
          return <OutputCellTextPlain key={index} outputs={data.outputs} />;
        }
        return null;
      })}
    </React.Fragment>
  );
};

export default OutputCell;
