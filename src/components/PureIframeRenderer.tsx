/* eslint-disable @typescript-eslint/no-explicit-any */
import { iframeResizer } from 'iframe-resizer';
import TurndownService from 'turndown';
import { v4 } from 'uuid';
import Script from 'next/script';

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

  const onInitializedIframe = () => {
    try {
      const myIframe: any = document.getElementById('theframe');

      if (myIframe) {
        console.log('Resizing...');
        iframeResizer(
          {
            log: false,
            checkOrigin: false,
            inPageLinks: true,
            scrolling: false,
            resizedCallback: (data) => {
              console.log(data.height);
            },
          },
          `#theframe`,
        );

        const doc = myIframe!.contentDocument;

        if (doc && doc.body) {
          doc.body.innerHTML = `${doc.body.innerHTML}<style>
              .mqc_table .wrapper {
                z-index: 0 !important;
              }
            </style>`;
        }
      }
    } catch (ex) {
      // Silent
    }
  };

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
          minHeight: '68vh',
        }}
        src={`${'/scs'}${file.path_scs}`}
        onLoad={onInitializedIframe}
      />
    </>
  );
};

export default PureIframeRenderer;
