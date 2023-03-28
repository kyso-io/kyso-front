/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef, useState } from 'react';

interface Props {
  outputs: string[];
}

const OutputCellHtml = ({ outputs }: Props) => {
  const plainHtml: string = useMemo(() => {
    const htmlOutputs: string = outputs.join('');
    if (htmlOutputs.indexOf('<table') > -1) {
      const indexStartTable: number = outputs.findIndex((output: string) => output.indexOf('<table') > -1) + 1;
      const indexEndTable: number = outputs.findIndex((output: string) => output.indexOf('</table>') > -1) - 1;
      const tableContent: string = outputs.slice(indexStartTable, indexEndTable + 1).join('');
      const table = document.createElement('table');
      table.innerHTML = tableContent;
      let html = `<div class="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">`;
      html += `<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">`;
      html += `<table class="min-w-full divide-y divide-gray-300">`;
      html += `<thead>`;
      table.querySelectorAll('thead tr').forEach((row: any) => {
        html += `<tr>`;
        row.querySelectorAll('th').forEach((cell: any, index: number) => {
          html += `<th scope="col" class="py-3.5 ${index === 0 ? 'pl-4 pr-3' : 'px-3'} text-left text-sm font-semibold text-gray-900">${cell.innerHTML}</th>`;
        });
        html += `</tr>`;
      });
      html += `</thead>`;
      html += `<tbody class="divide-y divide-gray-200">`;
      table.querySelectorAll('tbody tr').forEach((row: any) => {
        html += `<tr>`;
        row.querySelectorAll('th, td').forEach((cell: any, index: number) => {
          html += `<td class="whitespace-nowrap py-4 ${index === 0 ? 'pl-4 pr-3' : 'px-3'} text-sm font-medium text-gray-500 sm:pl-0">${cell.innerHTML}</td>`;
        });
        html += `</tr>`;
      });
      html += `</tbody>`;
      html += `</table>`;
      html += `</div>`;
      html += `</div>`;
      return html;
    }
    return htmlOutputs;
  }, [outputs]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const ref = useRef<any>(null);
  const [height, setHeight] = useState('100px');
  const startPolling = () => {
    if (ref?.current?.contentWindow?.document?.body?.scrollHeight) {
      setHeight(`${ref.current.contentWindow.document.body.scrollHeight + 50}px`);
      return;
    }
    setTimeout(startPolling, 100);
  };

  const onLoad = () => {
    startPolling();
  };

  if (plainHtml.indexOf('Bokeh') > -1) {
    return (
      <iframe
        ref={ref}
        onLoad={onLoad}
        id="bokeh-iframe"
        srcDoc={plainHtml}
        width="100%"
        height={height}
        scrolling="no"
        frameBorder="0"
        style={{
          width: '100%',
          overflow: 'auto',
        }}
      ></iframe>
    );
  }
  return <div dangerouslySetInnerHTML={{ __html: plainHtml }} />;
};

export default OutputCellHtml;
