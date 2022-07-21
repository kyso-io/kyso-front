import React from 'react';
import hljs from 'highlight.js';

export type Props = {
  code: string;
};

export const CodeRenderer = (props: Props) => {
  if (!props.code) {
    return <p>Invalid properties</p>;
  }

  const highlightedCode = hljs.highlightAuto(props.code).value;

  return (
    <pre>
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }}></code>
    </pre>
  );
};

export default CodeRenderer;
