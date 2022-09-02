import React from 'react';
import { v4 } from 'uuid';

export type Props = {
  fileUrl: string;
  token?: string | null;
  style?: React.CSSProperties;
};

const RenderGoogleDocs = (props: Props) => {
  // const [isLoading, setIsLoading] = useState(true)
  const id = v4();
  let appliedStyle: React.CSSProperties;

  if (!props.fileUrl) {
    <p>Invalid properties</p>;
  }

  if (!props.style) {
    appliedStyle = {
      border: 'none 0px',
      height: '65vh',
    };
  } else {
    appliedStyle = props.style;
  }

  let parameters = `url=${props.fileUrl}`;

  if (props.token) {
    parameters += `?token=${props.token}&embedded=true`;
  }

  return (
    <iframe
      title={id}
      id={`iframe-${id}`}
      sandbox={`allow-scripts allow-same-origin allow-forms allow-modals allow-popups`}
      width="100%"
      style={appliedStyle}
      src={`https://docs.google.com/gview?${parameters}`}
    />
  );
};

export default RenderGoogleDocs;
