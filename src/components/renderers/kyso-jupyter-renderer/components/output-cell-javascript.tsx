/* eslint no-eval: off */

import { useEffect } from 'react';

interface Props {
  outputs: string[];
}

const OutputCellJavaScript = ({ outputs }: Props) => {
  useEffect(() => {
    eval(outputs.join(''));
  }, []);
  return null;
};

export default OutputCellJavaScript;
