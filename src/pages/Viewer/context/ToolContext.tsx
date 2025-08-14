import { createContext, useState, type JSX } from "react";

interface Props {
  children: JSX.Element | JSX.Element[];
}

const ToolContext = createContext<{
  currentTool: { id: string; color: string };
  setCurrentTool: React.Dispatch<
    React.SetStateAction<{
      id: string;
      color: string;
    }>
  >;
} | null>(null);

function ToolContextProvider({ children }: Props) {
  const [currentTool, setCurrentTool] = useState({
    id: "cursor",
    color: "rgba(255, 0, 0, .3)",
  });

  return (
    <ToolContext.Provider value={{ currentTool, setCurrentTool }}>
      {children}
    </ToolContext.Provider>
  );
}

export default ToolContextProvider;
export { ToolContext };
