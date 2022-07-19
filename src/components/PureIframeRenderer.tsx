import { iframeResizer } from "iframe-resizer";
import React, { useEffect } from "react";
import TurndownService from "turndown";
import { v4 } from "uuid";

const turndownPluginGfm = require("joplin-turndown-plugin-gfm");

const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.gfm);
turndownService.remove("div");
turndownService.remove("style");

type IPureIFrameRendererProps = {
  file: {
    path_scs: string;
  };
};

const PureIframeRenderer = (props: IPureIFrameRendererProps) => {
  const { file } = props;
  const id = v4();

  useEffect(() => {
    iframeResizer(
      {
        log: false,
        checkOrigin: false,
        inPageLinks: true,
        scrolling: false,
      },
      `#iframe-${id}`,
    );
  });

  if (!file || !file.path_scs || file.path_scs.length === 0) {
    return "Invalid path";
  }

  return (
    <iframe
      title={id}
      id={`iframe-${id}`}
      sandbox={`allow-scripts allow-same-origin allow-forms allow-modals allow-popups`}
      style={{
        border: "none 0px",
        width: "100%",
        minHeight: "1000px",
      }}
      src={`${"/scs"}${file.path_scs}`}
    />
  );
};

export default PureIframeRenderer;
