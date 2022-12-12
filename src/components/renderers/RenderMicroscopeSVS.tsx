import React from 'react';
import { v4 } from 'uuid';
import RenderError from './RenderError';

export type Props = {
  fileUrl: string;
  token?: string | null;
};

declare global {
  interface Window {
    svsFileParam: string | null;
  }
}

const RenderMicroscopeSVS = (props: Props) => {
  const id = v4();

  if (!props.fileUrl) {
    return <RenderError message={`Sorry, we can't retrieve the content of this SVS file`} />;
  }

  /* Accessing directly, no need to use token, if we use it things break */
  /*
  let parameters = `${props.fileUrl}`;
  if (props.token) {
    parameters += `?token=${props.token}`;
  }
  // Set global value
  window.svsFileParam = parameters;
  */

  // Set global value
  window.svsFileParam = props.fileUrl;

  return (
    <>
      <iframe
        title={id}
        id={`iframe-${id}`}
        sandbox={`allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads`}
        width="100%"
        style={{
          border: 'none 0px',
          height: '74vh',
        }}
        src={`/microscope-svs-render.html`}
      />
    </>
  );
};

export default RenderMicroscopeSVS;
