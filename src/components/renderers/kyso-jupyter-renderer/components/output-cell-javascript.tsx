/* eslint no-eval: off */

import { useEffect } from 'react';

interface Props {
  outputs: string[];
}

const OutputCellJavaScript = ({ outputs }: Props) => {
  useEffect(() => {
    if (outputs && Array.isArray(outputs)) {
      eval(outputs.join(''));
    }
  }, []);
  return null;
};

export default OutputCellJavaScript;
