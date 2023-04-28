import { Helper } from '@/helpers/Helper';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const { highlight } = router.query;

  if (props.source) {
    // Compute baseUrl
    const urlElements = props.fileUrl.split('/');
    urlElements.pop();
    const baseUrl = urlElements.join('/');
    // Adjust imagesDir & tocAttribute
    let imagesDir: string | undefined;
    let tocAttribute: string | undefined;
    // Get the attributes from the document, reading it line by line
    const source = props.source.toString();

    const sourceLines: string[] = source.split(/\r?\n/);
    for (let i = 0; i < sourceLines.length; i += 1) {
      const line: string = sourceLines[i] || '';
      if (!imagesDir && line.indexOf(':imagesdir:') === 0) {
        const iDir = line.replace(':imagesdir:', '').trim();
        if (iDir.indexOf('http://') !== 0 && iDir.indexOf('https://') !== 0) {
          imagesDir = `${baseUrl}/${iDir}`;
        }
      }
      if (!tocAttribute && line.indexOf(':toc:') === 0) {
        tocAttribute = line.replace(':toc:', '').trim();
      }
      // FIXME: Probably we can stop processing the document early if we know
      // how to detect that the document header is already parsed (:imagesdir:
      // and :toc: are Header Only attributes).
      if (tocAttribute && imagesDir) {
        break;
      }
    }
    if (!imagesDir) {
      imagesDir = baseUrl;
    }
    const options = {
      safe: 'secure',
      extension_registry: registry,
      attributes: {
        imagesdir: imagesDir,
        showtitle: true,
        'source-highlighter': 'highlightjs-ext',
        toc: tocAttribute,
      },
    };
    const html = asciidoctor.convert(source, options);
    const highlightedHtml = Helper.highlight(html, highlight as string);
    const className = 'prose max-w-none break-words prose-pre:bg-stone-400';
    return <div className={className} dangerouslySetInnerHTML={{ __html: highlightedHtml }} />;
  }
  return <div>No content to show</div>;
};
