import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMermaid } from '../hooks/use-mermaid';

interface Props {
  source: string;
}

const id: string = uuidv4();
const Mermaid = ({ source }: Props) => {
  const svg: string | null = useMermaid(`mermaid-${id}`, source);
  if (!svg) {
    return <div>Loading...</div>;
  }
  return <div className="text-center" dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default Mermaid;
