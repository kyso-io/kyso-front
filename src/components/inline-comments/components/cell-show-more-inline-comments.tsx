import React from 'react';

interface Props {
  numComments: number;
  showAllComments: () => void;
}

const CellShowMoreInlineComments = ({ numComments, showAllComments }: Props) => {
  let text: string = '1 more comment';
  if (numComments > 1) {
    text = `${numComments} more comments`;
  }
  return (
    <div className="more-comments" onClick={showAllComments}>
      {text}
    </div>
  );
};

export default CellShowMoreInlineComments;
