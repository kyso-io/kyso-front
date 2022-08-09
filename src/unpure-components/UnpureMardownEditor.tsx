import '@fortawesome/fontawesome-svg-core/styles.css';
import { useState } from 'react';
import classNames from '@/helpers/class-names';
import UnpureMarkdownToolBar from './UnpureMarkdownToolBar';

type IUnpureMarkdownEditor = {
  setContent: (newContent: string) => void;
  newContent: string;
};

const UnpureMarkdownEditor = (props: IUnpureMarkdownEditor) => {
  const { setContent = () => {}, newContent = '' } = props;
  const [isFocus, onFocus] = useState(false);

  return (
    <div className="sm:col-span-6">
      <div
        className={classNames(
          isFocus ? 'ring-blue-500 border-blue-500 border' : 'border border-gray-300  ring-gray-300 ',
          'bg-white border-radius-4 block w-full border rounded-md shadow-sm sm:text-sm p-1',
        )}
      >
        <textarea
          id="textAreaID"
          name="description"
          rows={20}
          className="w-full border border-0px border-white sm:text-sm z-0 focus:ring-white focus:border-white"
          defaultValue={newContent}
          placeholder="Readme.md content"
          onChange={(e) => {
            onFocus(true);
            
            if(e) {
              setContent(e.target.value);
            }
          }}
          onBlur={() => onFocus(false)}
          onClick={() => onFocus(true)}
        />
        <UnpureMarkdownToolBar setContent={setContent} />
      </div>
    </div>
  );
};

export default UnpureMarkdownEditor;
