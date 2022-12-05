import React from 'react';
import { v4 } from 'uuid';
import RenderError from './RenderError';

export type Props = {
  fileUrl: string;
  fileSCS: string;
  token?: string | null;
};

const RenderMicroscopeSVS = (props: Props) => {
  const id = v4();

  if (!props.fileUrl) {
    return <RenderError message={`Sorry, we can't retrieve the content of this Microsoft Office file`} />;
  }

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
        src={`/microscope-svs-render.html?file=${props.fileUrl}&scs=${props.fileSCS}`}
      />
    </>
  );
};

export default RenderMicroscopeSVS;
