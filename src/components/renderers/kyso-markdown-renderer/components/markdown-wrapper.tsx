import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import directive from 'remark-directive';
import gfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { useHover } from 'usehooks-ts';
import { visit } from 'unist-util-visit';
import remarkUnwrapImages from 'remark-unwrap-images';
import { LinkIcon } from '@heroicons/react/outline';
import Mermaid from './mermaid';
import RenderCode from '../../RenderCode';

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

type HeadingResolverProps = {
  level: number;
  children: JSX.Element[];
};

// https://github.com/remarkjs/react-markdown/issues/358
const Heading: React.FC<HeadingResolverProps> = ({ level, children }) => {
  // Access actual (string) value of heading

  const heading = children[0];

  // If we have a heading, make it lower case
  let anchor = typeof heading === 'string' ? heading : '';

  // Clean anchor (replace special characters whitespaces).
  // Alternatively, use encodeURIComponent() if you don't care about
  // pretty anchor links
  anchor = anchor.replace(/[^a-zA-Z0-9 ]/g, '');
  anchor = anchor.replace(/ /g, '-');
  const hoverRef = useRef(null);
  const isHover = useHover(hoverRef);

  // Utility
  const container = (nodeChildren: React.ReactNode): JSX.Element => (
    <a
      ref={hoverRef}
      id={anchor}
      href={`#${anchor}`}
      className="scroll-mt-20 no-underline flex items-center flex-row"
      style={{
        scrollMarginTop: '120px',
      }}
    >
      <span>{nodeChildren}</span>
      {isHover && <LinkIcon className="mx-2 w-5 h-5" />}
    </a>
  );

  switch (level) {
    case 1:
      return <h1>{container(children)}</h1>;
    case 2:
      return <h2>{container(children)}</h2>;
    case 3:
      return <h3>{container(children)}</h3>;
    case 4:
      return <h4>{container(children)}</h4>;
    case 5:
      return <h5>{container(children)}</h5>;
    default:
      return <h6>{container(children)}</h6>;
  }
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const components: any = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  img: (props: any) => <img {...props} style={{ width: '100%' }} alt={props.alt} />,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  mermaid: (props: any) => <Mermaid source={props.text} />,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  pre: (props: any) => {
    // it gets a code child
    const { children: codeChild } = props.node;

    // we want its child to get the value
    const { children } = codeChild[0];
    if (children.length > 0) {
      return <RenderCode code={children[0].value} />;
    }

    return <pre {...props} />;
  },
  h1: Heading,
  h2: Heading,
  h3: Heading,
  h4: Heading,
  h5: Heading,
  h6: Heading,
};

interface Props {
  source: string;
}
const MarkdownWrapper = ({ source }: Props) => {
  return (
    <div className="prose max-w-none break-all">
      <ReactMarkdown remarkPlugins={[gfm, remarkMath, directive, customDirectives, remarkUnwrapImages]} rehypePlugins={[rehypeSlug, rehypeKatex, rehypeRaw]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownWrapper;
