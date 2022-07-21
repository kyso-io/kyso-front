/* eslint-disable no-else-return */
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
  output: Output;
  showOutput: boolean;
  dataTypes: DataType[];
}

const OutputCell = ({ showOutput, dataTypes }: Props) => {
  return (
    <React.Fragment>
      {dataTypes.map((data: DataType, index: number) => {
        if (showOutput && data.type === 'text/plain') {
          return <OutputCellTextPlain key={index} outputs={data.outputs} />;
        } else if (data.type === 'image/png') {
          return <OutputCellImage key={index} output={Array.isArray(data.outputs) ? data.outputs[0] : data.outputs} />;
        } else if (data.type === 'stream') {
          return <OutputCellStream key={index} outputs={data.outputs} />;
        } else if (showOutput && data.type === 'application/json') {
          return <OutputCellJSON key={index} output={data.outputs[0]} />;
        } else if (showOutput && data.type === 'error') {
          return <OutputCellError key={index} outputs={data.outputs} />;
        } else if (data.type === 'text/html') {
          return <OutputCellHtml key={index} outputs={data.outputs} />;
        } else if (data.type === 'application/vnd.plotly.v1+json') {
          return <OutputCellPlotly key={index} outputs={data.outputs} />;
        } else if (showOutput) {
          return <OutputCellTextPlain key={index} outputs={data.outputs} />;
        }

        return null;
      })}
    </React.Fragment>
  );
};

export default OutputCell;
