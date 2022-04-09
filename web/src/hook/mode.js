import { createContext, useContext } from "react";

const ColorModeContext = createContext({ toggleColorMode: () => {} });

const useColorModeContent = () => useContext(ColorModeContext);

export { ColorModeContext };
export default useColorModeContent;
