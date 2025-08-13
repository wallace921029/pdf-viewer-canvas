import styles from "./styles/pdf-page-render.module.scss";
import { useEffect, useRef } from "react";

interface Props {
  viewSize: { width: number; height: number };
  imageCanvas: HTMLCanvasElement;
  textDiv: HTMLDivElement;
}

function PdfPageRender({ viewSize, imageCanvas, textDiv }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // clear the container
      containerRef.current.innerHTML = "";

      // image layer
      containerRef.current.appendChild(imageCanvas);

      // text layer
      textDiv.classList.add("textLayer");
      textDiv.style.width = `${viewSize.width}px`;
      textDiv.style.height = `${viewSize.height}px`;
      containerRef.current.appendChild(textDiv);
    }
  }, [viewSize, imageCanvas, textDiv]);

  return (
    <div
      className={`${styles.pdfPageRender}`}
      style={{ width: `${viewSize.width}px`, height: `${viewSize.height}px` }}
      ref={containerRef}
    />
  );
}

export default PdfPageRender;
