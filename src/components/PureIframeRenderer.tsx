import { iframeResizer } from 'iframe-resizer';
import React, { useEffect, useState } from 'react';
import TurndownService from 'turndown';
import { v4 } from 'uuid';

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
  const [resizedHeight, setResizedHeight] = useState('65vh');
  const frameId = `iframe-${id}`;

  useEffect(() => {
    iframeResizer(
      {
        log: false,
        checkOrigin: false,
        inPageLinks: true,
        scrolling: false,
        resizedCallback: (data) => {
          setResizedHeight(`${data.height} px`);
        },
      },
      frameId,
    );
  }, []);

  if (!file || !file.path_scs || file.path_scs.length === 0) {
    return <div>Invalid path</div>;
  }

  return (
    <iframe
      title={id}
      id={frameId}
      sandbox={`allow-scripts allow-same-origin allow-forms allow-modals allow-popups`}
      style={{
        border: 'none 0px',
        width: '100%',
        height: resizedHeight,
      }}
      src={`${'/scs'}${file.path_scs}`}
    />
  );
};

export default PureIframeRenderer;
