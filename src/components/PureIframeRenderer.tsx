/* eslint-disable @typescript-eslint/no-explicit-any */
import TurndownService from 'turndown';
import { v4 } from 'uuid';
import Script from 'next/script';
import { useState } from 'react';

const turndownPluginGfm = require('joplin-turndown-plugin-gfm');

const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.gfm);
turndownService.remove('div');
turndownService.remove('style');

type IPureIFrameRendererProps = {
  file: {
    path_scs: string;
  };
};

const PureIframeRenderer = (props: IPureIFrameRendererProps) => {
  const { file } = props;
  const id = v4();
  const [height, setHeight] = useState('70vh');

  const onInitializedIframe = () => {
    try {
      const myIframe: any = document.getElementById('theframe');
      setTimeout(() => {
        setHeight(`${myIframe.contentWindow.document.body.scrollHeight + 20}px`);
      }, 1500);
    } catch (ex) {
      // Silent
    }
  };

  const jwtToken = localStorage.getItem('jwt');

  let parameters = `${'/scs'}${file.path_scs}`;

  if (jwtToken) {
    parameters += `?token=${jwtToken}`;
  }

  if (!file || !file.path_scs || file.path_scs.length === 0) {
    return <div>Invalid path</div>;
  }

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.8.3/plotly.min.js" />
      <iframe
        title={id}
        id="theframe"
        sandbox={`allow-scripts allow-same-origin allow-forms allow-modals allow-popups`}
        style={{
          border: 'none 0px',
          width: '100%',
          height,
          overflow: 'hidden',
        }}
        src={parameters}
        onLoad={onInitializedIframe}
      />
    </>
  );
};

export default PureIframeRenderer;
