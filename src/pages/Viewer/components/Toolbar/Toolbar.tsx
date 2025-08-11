import styles from "./styles/toolbar.module.scss";

import cursorSVG from "@/assets/svg/cursor.svg";
import brushSVG from "@/assets/svg/brush.svg";
import rectangleSVG from "@/assets/svg/rectangle.svg";
import { Divider } from "@arco-design/web-react";
import { Fragment, useState } from "react";
import Palette from "./Palette";
import OtherActions from "./OtherActions";

const toolItems = [
  { id: "cursor", icon: cursorSVG, title: "Cursor" },
  { id: "brush", icon: brushSVG, title: "Brush" },
  { id: "rectangle", icon: rectangleSVG, title: "Rectangle" },
];

function Toolbar() {
  const [selectedTool, setSelectedTool] = useState("cursor");
  const [selectedColor, setSelectedColor] = useState("");

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbox}>
        {toolItems.map((item) => (
          <Fragment key={item.id}>
            <div
              className={`${styles.toolboxItem} ${
                selectedTool === item.id ? styles.toolboxItemSelected : ""
              }`}
              title={item.title}
              onClick={() => setSelectedTool(item.id)}
            >
              <img src={item.icon} alt={item.id} />
            </div>
            <Divider type="vertical" />
          </Fragment>
        ))}
        <Palette onColorChange={setSelectedColor} />
        <Divider type="vertical" />
        <OtherActions />
      </div>
    </div>
  );
}

export default Toolbar;
