import mermaid from 'mermaid';
import { useEffect, useState } from 'react';

export const useMermaid = (id: string, content: string) => {
  const [svg, setSvg] = useState<string | null>(null);
  mermaid.mermaidAPI.initialize({});

  useEffect(() => {
    mermaid.mermaidAPI.render(id, content, (svgraph: string) => {
      setSvg(svgraph);
    });
  }, [id, content]);

  return svg;
};
