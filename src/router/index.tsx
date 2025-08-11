import { createBrowserRouter } from "react-router";
import Homepage from "@/pages/Homepage/Homepage";
import Viewer from "@/pages/Viewer/Viewer";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Homepage,
  },
  {
    path: "/viewer",
    Component: Viewer,
  },
]);

export default router;
