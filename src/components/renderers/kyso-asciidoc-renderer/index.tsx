import React from 'react';

const asciidoctor = require('asciidoctor')();

// Load extensions
const highlightJsExt = require('asciidoctor-highlight.js');

// Register extensions into custom registry.
const registry = asciidoctor.Extensions.create();
highlightJsExt.register(registry);

interface Props {
  fileUrl: string;
  source: string | Buffer;
}

export const RenderAsciidoc = (props: Props) => {
  if (props.source) {
    // Compute baseUrl
    const urlElements = props.fileUrl.split('/');
    urlElements.pop();
    const baseUrl = urlElements.join('/');
    // Adjust imagesDir
    let imagesDir: string = baseUrl;
    const source = props.source.toString();
    // If there is a value on the document, add it to the baseUrl
    const sourceLines: string[] = source.split(/\r?\n/);
    for (let i = 0; i < sourceLines.length; i += 1) {
      const line: string = sourceLines[i] || '';
      if (line.indexOf(':imagesdir:') === 0) {
        const iDir = line.replace(':imagesdir:', '').trim();
        if (iDir.indexOf('http://') !== 0 && iDir.indexOf('https://') !== 0) {
          imagesDir = `${baseUrl}/${iDir}`;
          break;
        }
      }
    }
    const options = {
      safe: 'secure',
      extension_registry: registry,
      attributes: {
        imagesdir: imagesDir,
        showtitle: true,
        'source-highlighter': 'highlightjs-ext',
      },
    };
    const html = asciidoctor.convert(source, options);
    const className = 'prose max-w-none break-words prose-pre:bg-stone-400';
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <div>No content to show</div>;
};
