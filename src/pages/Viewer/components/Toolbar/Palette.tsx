import styles from "./styles/palette.module.scss";

import { useEffect, useState } from "react";
import paletteSVG from "@/assets/svg/palette.svg";

interface Props {
  onColorChange: (color: string) => void;
}

// rainbow colors
const paletteColors = [
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#0000FF",
  "#4B0082",
  "#9400D3",
];

function Palette({ onColorChange }: Props) {
  const [currentColor, setCurrentColor] = useState(paletteColors[0]);

  useEffect(() => {
    onColorChange(currentColor);
  }, [currentColor]);

  return (
    <div className={styles.palette}>
      <div className={styles.icon}>
        <img src={paletteSVG} alt="Palette" title="Palette" />
      </div>
      <ul>
        {paletteColors.map((color) => (
          <li
            key={color}
            style={{
              /* @ts-ignore */
              "--palette-color": color,
              backgroundColor: color,
            }}
            className={`${currentColor === color ? styles.colorSelected : ""}`}
            onClick={() => setCurrentColor(color)}
          />
        ))}
      </ul>
    </div>
  );
}

export default Palette;
