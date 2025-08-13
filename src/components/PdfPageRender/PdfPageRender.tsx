import styles from "./styles/pdf-page-render.module.scss";
import "pdfjs-dist/web/pdf_viewer.css";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";

interface Props {
  canvasLayer: HTMLCanvasElement;
  textLayer?: HTMLDivElement;
  annotationLayer?: HTMLCanvasElement;
}

function PdfPageRender({ canvasLayer, textLayer, annotationLayer }: Props) {
  const layerContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // event listener for text range selection
  const handleTextRangeSelection = (event: MouseEvent) => {
    // const rect = new fabric.Rect({
    //   left: 0,
    //   top: 0,
    //   width: 100,
    //   height: 100,
    //   fill: "rgba(0,0,255,0.3)",
    //   stroke: "blue",
    //   selectable: true,
    //   hasControls: true,
    // });
    // fabricCanvasRef.current?.add(rect);
    fabricCanvasRef.current!.lowerCanvasEl.style.pointerEvents = "auto";
  };

  useEffect(() => {
    const layerContainer = layerContainerRef.current;

    if (layerContainer) {
      layerContainer.innerHTML = "";
      layerContainer.appendChild(canvasLayer);

      if (textLayer) {
        textLayer.classList.add("textLayer");
        layerContainer.appendChild(textLayer);
      }

      if (annotationLayer) {
        annotationLayer.classList.add("annotationLayer");

        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
        }

        const canvas = new fabric.Canvas(annotationLayer);
        fabricCanvasRef.current = canvas;

        // test rect
        const rect = new fabric.Rect({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
          fill: "rgba(0,0,255,0.3)",
          stroke: "blue",
          selectable: true,
          hasControls: true,
        });
        fabricCanvasRef.current?.add(rect);
        fabricCanvasRef.current!.lowerCanvasEl.style.pointerEvents = "auto";

        layerContainer.appendChild(annotationLayer);
      }

      // add event listener
      layerContainerRef.current?.addEventListener(
        "mouseup",
        handleTextRangeSelection
      );
    }

    return () => {
      layerContainerRef.current?.removeEventListener(
        "mouseup",
        handleTextRangeSelection
      );
    };
  }, [canvasLayer, textLayer]);

  return (
    <div className={`${styles.pdfPageRender} pdfLayer`}>
      <div
        style={{ position: "relative", margin: "0 auto" }}
        ref={layerContainerRef}
      />
    </div>
  );
}

export default PdfPageRender;
