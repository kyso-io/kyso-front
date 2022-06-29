import React, { createContext, useState } from 'react';

export const AppStateContext = createContext(false);

const AppStateContextProvider = (props) => {
  const [isShownInput, setShowInput] = useState(true);
  const [isShownOutput, setShowOutput] = useState(true);
  const [inlineCommentsActived, setInlineCommentsActived] = useState(true);
  return (
    <AppStateContext.Provider
      value={{
        isShownInput,
        setShowInput,
        isShownOutput,
        setShowOutput,
        inlineCommentsActived,
        setInlineCommentsActived,
      }}
    >
      {props.children}
    </AppStateContext.Provider>
  );
};

export default AppStateContextProvider;
