import { createBrowserRouter } from "react-router";
import Homepage from "@/pages/Homepage/Homepage";
import Viewer from "@/pages/Viewer/Viewer";
import FabricDemo from "@/pages/FabricDemo/FabricDemo";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Homepage,
  },
  {
    path: "/viewer",
    Component: Viewer,
  },
  {
    path: "/fabric-demo",
    Component: FabricDemo,
  },
]);

export default router;
