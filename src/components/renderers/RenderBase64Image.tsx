import React from 'react';

export type Props = {
  base64: string;
  alt?: string;
};

const RenderBase64Image = (props: Props) => {
  if (!props.base64) {
    return <h2>This image can&apos;t be rendered</h2>;
  }

  let src: string = '';

  if (props.base64.includes('data:image')) {
    src = props.base64;
  } else {
    src = `data:image/jpeg;base64,${props.base64}`;
  }

  return <img src={src} alt={props.alt ? props.alt : 'An image'} />;
};

export default RenderBase64Image;
