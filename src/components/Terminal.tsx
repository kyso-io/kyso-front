/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
import { Transition } from '@headlessui/react';
import type { SyntheticEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

const Terminal = () => {
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const refComments = useRef<any>(null);
  const pressedKeys: string[] = [];

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      pressedKeys.push(e.key);

      if (pressedKeys.filter((x) => x === 'Shift').length >= 3) {
        if (showTerminal) {
          setShowTerminal(false);
        } else {
          setShowTerminal(true);

          setTimeout(() => {
            refComments.current.focus();
          }, 200);
        }
      }
    };
    document.addEventListener('keydown', keyDownHandler);

    // clean up
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);
  return (
    <>
      {true && (
        <>
          <Transition
            className="terminal-window"
            show={showTerminal}
            enter="transition-all ease-in-out duration-500 delay-[200ms]"
            enterFrom="opacity-0 translate-y-6"
            enterTo="opacity-100 translate-y-0"
            leave="transition-all ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="terminal-window">
              <header>
                <div className="button green"></div>
                <div className="button yellow"></div>
                <div className="button red"></div>

                <span
                  style={{
                    float: 'right',
                    fontSize: '12px',
                    marginRight: '10px',
                  }}
                >
                  Model:
                  <select
                    style={{
                      height: '22px',
                      marginLeft: '4px',
                      marginTop: '5px',
                      padding: 0,
                      fontSize: '12px',
                      width: '140px',
                      paddingLeft: '4px',
                      paddingBottom: '2px',
                    }}
                  >
                    <option selected>Kyso Examples</option>
                    <option>Kyso Internal</option>
                    <option>Kyso Engineering</option>
                  </select>
                </span>
              </header>
              <section className="terminal">
                🤖 Welcome to KysoGPT! Ask anything, and if you need help, just type "help"
                <div className="history">
                  {history.map((x) => {
                    return (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: x }} />
                      </>
                    );
                  })}
                </div>
                $&nbsp;
                <span
                  ref={refComments}
                  id="editable"
                  contentEditable="true"
                  style={{
                    color: 'white',
                    background: 'transparent',
                    border: 'none',
                    minHeight: '10px',
                    width: '100%',
                  }}
                  onKeyDown={(e: SyntheticEvent<HTMLSpanElement, KeyboardEvent>) => {
                    if ((e as any).key === 'Enter') {
                      const innerText = refComments.current.innerText as string;

                      switch (innerText.trim()) {
                        case 'help':
                          // Print help
                          const newHistory = [
                            ...history,
                            `$ ${innerText}`,
                            `KysoGPT trains a model per organization. Now you are in <b>Kyso Examples</b> organization, and the answers of KysoGPT will be based on the reports, files and comments that have been produced inside it.<br/>`,
                            `<br/>To switch to another model you can use the selector in the top bar of the terminal, or type <i>switch "Kyso Examples"</i> in the terminal`,
                          ];

                          setHistory(newHistory);
                          break;
                        case 'clear':
                          setHistory([]);
                          break;
                        default:
                          if (innerText.includes('automatic testing')) {
                            const answer = [
                              ...history,
                              `$ ${innerText}`,
                              `The automatic tests for Kyso Store's version 1.1.16 were <b>successful</b>. A total of 24 test cases were executed, and 100% of them passed.`,
                              `These tests were executed 7 months ago and were triggered by <a style="color: aqua; text-decoration: underline" href="mailto:francisco@kyso.io">francisco@kyso.io</a>. You can see the full report <a style="color: aqua; text-decoration: underline" href="/kyso-engineering/test-reports/kyso-store-automatic-test-results-1116">here</a>`,
                            ];

                            setHistory(answer);
                            break;
                          } else {
                            const answer = [...history, `$ ${innerText}`, `Sorry, I don't have enough context to answer your question.`];

                            setHistory(answer);
                            break;
                          }
                      }

                      // In any case, move the cursor to the end of the answer
                      refComments.current.innerText = '';
                    }
                  }}
                ></span>
                <span className="prompt"></span>
                <span className="typed-cursor"></span>
              </section>
            </div>
          </Transition>
        </>
      )}
    </>
  );
};

export default Terminal;
