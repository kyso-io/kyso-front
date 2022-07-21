/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import directive from 'remark-directive';
import gfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { visit } from 'unist-util-visit';
import remarkUnwrapImages from 'remark-unwrap-images';
import Mermaid from './mermaid';

function customDirectives() {
  function onContainerDirective(node: any) {
    const { name, attributes, children } = node;
    const text = children[0]?.children[0]?.value ?? '';
    const data = node.data || (node.data = {});
    data.hName = name;
    data.hProperties = { ...attributes, text };
  }

  function transform(tree: any) {
    visit(tree, 'containerDirective', onContainerDirective);
  }

  return transform;
}

const components: any = {
  img: (props: any) => <img {...props} style={{ width: '100%' }} alt={props.alt} />,
  mermaid: (props: any) => <Mermaid source={props.text} />,
};

interface Props {
  source: string;
}

const Markdown = ({ source }: Props) => {
  return (
    <ReactMarkdown remarkPlugins={[gfm, remarkMath, directive, customDirectives, remarkUnwrapImages]} rehypePlugins={[rehypeKatex, rehypeRaw]} components={components}>
      {source}
    </ReactMarkdown>
  );
};

export default Markdown;
