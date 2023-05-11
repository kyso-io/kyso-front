import { MathJax, MathJaxContext } from 'better-react-mathjax';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import directive from 'remark-directive';
import gfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkUnwrapImages from 'remark-unwrap-images';
import { visit } from 'unist-util-visit';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Mermaid from './mermaid';
import RenderCode from '../../RenderCode';
import { Helper } from '../../../../helpers/Helper';

function customDirectives() {
  return transform;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  function transform(tree: any) {
    visit(tree, 'containerDirective', onContainerDirective);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  function onContainerDirective(node: any) {
    const { name, attributes, children } = node;
    const text = children[0]?.children[0]?.value ?? '';
    const data = node.data || (node.data = {});
    data.hName = name;
    data.hProperties = { ...attributes, text };
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const components: any = {
  // Edit link
  a: (props: any) => {
    const { href, children } = props;
    return (
      <a className="text-blue-500 hover:underline" href={href}>
        {children}
      </a>
    );
  },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  img: (props: any) => <img {...props} style={{ width: 'auto', maxWidth: '70%' }} alt={props.alt} />,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  mermaid: (props: any) => <Mermaid source={props.text} />,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  pre: (props: any) => {
    // it gets a code child
    const { children: codeChild } = props.node;

    // we want its child to get the value
    const { children } = codeChild[0];

    if (children.length > 0) {
      // return mermaid if the code type is identified as such
      if (Array.isArray(codeChild[0].properties.className) && codeChild[0].properties.className.lenght > 0 && codeChild[0].properties.className[0] === 'language-mermaid') {
        return <Mermaid source={children[0].value} />;
      }
      // return the render code in other cases
      return <RenderCode code={children[0].value} />;
    }

    return <pre {...props} />;
  },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  math: (props: any) => <MathJax>{props.value}</MathJax>,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  inlineMath: (props: any) => <MathJax>{props.value}</MathJax>,
  // h1: Heading,
  // h2: Heading,
  // h3: Heading,
  // h4: Heading,
  // h5: Heading,
  // h6: Heading,
};

interface Props {
  source: string;
}
const MarkdownWrapper = ({ source }: Props) => {
  const router = useRouter();
  const { highlight } = router.query;

  const [highlightedText, setHighlightedText] = useState(source || 'No source');

  useEffect(() => {
    const computedText = Helper.highlight(source, highlight as string);
    setHighlightedText(computedText);
  }, [highlight]);

  return (
    <div className="prose max-w-none break-words">
      <MathJaxContext>
        <ReactMarkdown remarkPlugins={[gfm, remarkMath, directive, customDirectives, remarkUnwrapImages]} rehypePlugins={[rehypeSlug, rehypeKatex, rehypeRaw]} components={components}>
          {highlightedText}
        </ReactMarkdown>
      </MathJaxContext>
    </div>
  );
};

export default MarkdownWrapper;
