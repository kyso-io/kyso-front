/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react';

interface Props {
  outputs: string[];
}

const OutputCellHtml = ({ outputs }: Props) => {
  const plainHtml: string = outputs.join('');
  const ref = useRef<any>(null);
  const [height, setHeight] = React.useState('100px');

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
  return (
    <React.Fragment>
      <div className="text-center" dangerouslySetInnerHTML={{ __html: plainHtml }} />
    </React.Fragment>
  );
};

export default OutputCellHtml;
