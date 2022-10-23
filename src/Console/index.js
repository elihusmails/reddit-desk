import { createContext, useCallback, useContext, useState } from "react";

export const ConsoleContext = createContext({
  consolePush: () => null,
  console: [],
  setConsole: () => null
});

export const ConsoleProvider = ({ children }) => {
  const [console, setConsole] = useState([]);
  const consolePush = useCallback(async (obj) => {
    setConsole((c) => [...c, obj]);
  }, []);
  return (
    <ConsoleContext.Provider value={{ consolePush, console, setConsole }}>
      {children}
    </ConsoleContext.Provider>
  );
};

export const useConsole = () => {
  const context = useContext(ConsoleContext);
  return context;
};
