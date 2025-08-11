import styles from "./styles/pdf-page-render.module.scss";
import { useEffect, useRef, type JSX } from "react";

interface Props {
  canvasLayer: HTMLCanvasElement;
  textLayer?: HTMLDivElement;
  annotationLayer?: HTMLDivElement | HTMLCanvasElement;
}

function PdfPageRender({ canvasLayer, textLayer, annotationLayer }: Props) {
  const layerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layerContainer = layerContainerRef.current;

    if (layerContainer) {
      layerContainer.innerHTML = "";
      layerContainer.appendChild(canvasLayer);

      if (textLayer) {
        layerContainer.appendChild(textLayer);
      }
    }
  }, [canvasLayer, textLayer]);

  return <div className={styles.pdfPageRender} ref={layerContainerRef} />;
}

export default PdfPageRender;
