import { useRef, useState } from 'react';

interface Props {
  outputs: string[];
}

const OutputCellHtml = ({ outputs }: Props) => {
  const plainHtml: string = outputs.join('');

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
