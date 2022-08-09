import { PhotographIcon, LinkIcon } from '@heroicons/react/solid';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Tooltip } from 'flowbite-react';
import { faBlockQuote, faListOl, faListUl, faStrikethrough, faSigma, faSquareCaretRight, faHeading, faBold, faItalic } from '@fortawesome/pro-solid-svg-icons';
import { Menu, Transition } from '@headlessui/react';
import classNames from '@/helpers/class-names';
import { uploadMarkdownImageAction } from '@kyso-io/kyso-store';
import UnPureToolBarButton from './UnPureToolBarButton';

type IUnpureMarkdownToolBar = {
  setContent: (newContent: string) => void;
};

const UnpureMarkdownToolBar = (props: IUnpureMarkdownToolBar) => {
  const { setContent = () => {} } = props;
  const dispatch = useAppDispatch();

  const insertAtBeginningOfLine = (symbol: string) => {
    const elem = window.document.getElementById('textAreaID') as HTMLInputElement;
    const start = elem.selectionStart;
    const end = elem.selectionEnd;
    const text = elem.value;

    const newLineIndex = text.lastIndexOf('\n', start - 1);
    if (newLineIndex === -1) {
      elem.value = symbol + text;
    } else {
      elem.value = text.substring(0, newLineIndex + 1) + symbol + text.substring(newLineIndex + 1, text.length);
    }

    elem.setSelectionRange(start + symbol.length, end + symbol.length);
    setContent(elem.value);
    elem.focus();
  };

  const insertLink = () => {
    const elem = window.document.getElementById('textAreaID') as HTMLInputElement;
    const start = elem.selectionStart;
    const end = elem.selectionEnd;
    const text = elem.value;
    const link = '(http://www.mylink.com/)';

    if (start === end) {
      elem.value = `${text.substring(0, start)}[Link Text]${link}${text.substring(start, text.length)}`;
      elem.setSelectionRange(start, start);
    } else {
      wrapText('[', ']', link);
    }
    elem.focus();
  };

  const insertCollapsibleSetion = () => {
    const elem = window.document.getElementById('textAreaID') as HTMLInputElement;
    const start = elem.selectionStart;
    const end = elem.selectionEnd;
    const text = elem.value;
    const link = 'Click to expand';

    if (start === end) {
      elem.value = `${text.substring(0, start)}<details><summary>${link}</summary></details>${text.substring(start, text.length)}`;
      elem.setSelectionRange(start, end);
    } else {
      wrapText('<details><summary>', text, '</summary></details>');
    }
    elem.focus();
  };

  const wrapText = (symbol: string, endSymbol: string, insertAfter: string) => {
    if (!endSymbol) {
      endSymbol = symbol;
    }

    const elem = window.document.getElementById('textAreaID') as HTMLInputElement;
    const start = elem.selectionStart;
    const end = elem.selectionEnd;
    const text = elem.value;

    const afterText = insertAfter || '';

    elem.value = text.substring(0, start) + symbol + text.substring(start, end) + endSymbol + afterText + text.substring(end, text.length);
    elem.setSelectionRange(start + symbol.length, end + endSymbol.length);

    setContent(elem.value);
    elem.focus();
  };

  const onAddPreview = async (file) => {
    const elem = window.document.getElementById('textAreaID') as HTMLInputElement;
    const args = {
      file,
    };
    const result = await dispatch(uploadMarkdownImageAction(args as object));
    if (result?.payload) {
      wrapText('![', ']', `(${result.payload})`);
    }
    elem.focus();
  };

  const onChangeUploadPreview = (e: string[]) => {
    if (e.target.files.length > 0) {
      const picture = e.target.files[0];
      onAddPreview(picture);
    }
  };

  const heading = [
    { name: 'H1', onClick: '# ' },
    { name: 'H2', onClick: '## ' },
    { name: 'H3', onClick: '### ' },
  ];

  return (
    <>
      <span className="relative z-0 inline-flex shadow-sm rounded-md ml-1">
        <Menu>
          <Menu.Button className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
            <FontAwesomeIcon icon={faHeading} color="#9ca3af" />
            {/* add heading text  */}
          </Menu.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Menu.Items className="absolute right-0 mt-6 w-20 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="py-1">
                {heading.map((h) => (
                  <Menu.Item key={h.name}>
                    {({ active }) => (
                      <button onClick={() => insertAtBeginningOfLine(h.onClick)} className={classNames(active ? 'bg-gray-300' : '', 'w-20 block px-4 py-2 text-sm text-gray-700')}>
                        {h.name}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        <UnPureToolBarButton content={'Add bold text'} action={() => wrapText('**')} RenderFontawesomeIcon={faBold} />
        <UnPureToolBarButton content={'Add italic text'} action={() => wrapText('_')} RenderFontawesomeIcon={faItalic} />
        <UnPureToolBarButton content={'Add strikethrough text'} action={() => wrapText('~~')} RenderFontawesomeIcon={faStrikethrough} />
        <UnPureToolBarButton content={'Insert a quote'} action={() => insertAtBeginningOfLine('> ')} RenderFontawesomeIcon={faBlockQuote} />
        <UnPureToolBarButton content={'Insert a link'} action={() => insertLink()} TailwindIcon={LinkIcon} />
        <UnPureToolBarButton content={'Add a bullet list'} action={() => insertAtBeginningOfLine('- ')} RenderFontawesomeIcon={faListUl} />
        <UnPureToolBarButton content={'Add a numbered list'} action={() => insertAtBeginningOfLine('1. ')} RenderFontawesomeIcon={faListOl} />
        <UnPureToolBarButton content={'Add a collapsible section'} action={() => insertCollapsibleSetion()} RenderFontawesomeIcon={faSquareCaretRight} />
        <UnPureToolBarButton content={'Add a mathematic equation '} action={() => wrapText('$$')} RenderFontawesomeIcon={faSigma} />
        <div className="flex space-x-2 justify-center flex-wrap">
          <Tooltip content={'Add a photo'} style="dark">
            <div className="hidden relative overflow-hidden lg:block">
              <div className="-ml-px relative inline-flex items-center px-3 py-2 rounded mr-1 border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                <PhotographIcon className="relative -m-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                <label
                  htmlFor="desktop-user-photo"
                  className="absolute inset-0 w-full h-full bg-opacity/75 flex items-center justify-center text-sm font-medium text-white opacity-0 hover:opacity-100 focus-within:opacity-100"
                >
                  <input
                    type="file"
                    id="desktop-user-photo"
                    name="add-photo"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-gray-900"
                    onChange={(e) => onChangeUploadPreview(e)}
                  />
                </label>
              </div>
            </div>
          </Tooltip>
        </div>
      </span>
    </>
  );
};

export default UnpureMarkdownToolBar;
