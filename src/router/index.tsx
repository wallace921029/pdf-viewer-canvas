import { createBrowserRouter } from "react-router";
import Homepage from "@/pages/Homepage/Homepage";
import Viewer from "@/pages/Viewer/Viewer";
import FabricDemo from "@/pages/FabricDemo/FabricDemo";
import ToolContextProvider from "@/pages/Viewer/context/ToolContext";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Homepage,
  },
  {
    path: "/viewer",
    Component: () => (
      <ToolContextProvider>
        <Viewer />
      </ToolContextProvider>
    ),
  },
  {
    path: "/fabric-demo",
    Component: FabricDemo,
  },
]);

export default router;
