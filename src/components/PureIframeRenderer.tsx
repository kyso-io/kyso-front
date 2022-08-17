import { iframeResizer } from 'iframe-resizer';
import React, { useEffect } from 'react';
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
  const id = `iframe-${v4()}`;

  useEffect(() => {
    iframeResizer(
      {
        log: false,
        checkOrigin: false,
        inPageLinks: true,
        scrolling: false,
        id,
        resizedCallback: (data) => {
          console.log('RESIZED CALLBACK');
          console.log(data);
        },
        initCallback: () => {
          console.log('resizer');
        },
        autoResize: true,
      },
      `#${id}`,
    );
  }, []);

  if (!file || !file.path_scs || file.path_scs.length === 0) {
    return <div>Invalid path</div>;
  }

  return (
    <iframe
      title={id}
      id={id}
      sandbox={`allow-scripts allow-same-origin allow-forms allow-modals allow-popups`}
      style={{
        border: 'none 0px',
        width: '100%',
        minHeight: '65vh',
      }}
      src={`${'/scs'}${file.path_scs}`}
    />
  );
};

export default PureIframeRenderer;
