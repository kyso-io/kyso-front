import { createContext } from "react";

export const AppStateContext = createContext(false);

// const AppStateContextProvider = (props: { children: ReactElement }) => {
//   const { children } = props
//   const [isShownInput, setShowInput] = useState(true);
//   const [isShownOutput, setShowOutput] = useState(true);
//   const [inlineCommentsActived, setInlineCommentsActived] = useState(true);
//   return (
//     <AppStateContext.Provider
//       value={{
//         isShownInput,
//         setShowInput,
//         isShownOutput,
//         setShowOutput,
//         inlineCommentsActived,
//         setInlineCommentsActived,
//       }}
//     >
//       {children}
//     </AppStateContext.Provider>
//   );
// };

// export default AppStateContextProvider;
