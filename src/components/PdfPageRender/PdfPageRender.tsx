import styles from "./styles/pdf-page-render.module.scss";
import "pdfjs-dist/web/pdf_viewer.css";

import { useEffect, useRef } from "react";

interface Props {
  canvasLayer: HTMLCanvasElement;
  textLayer?: HTMLDivElement;
  annotationLayer?: HTMLDivElement | HTMLCanvasElement;
}

function PdfPageRender({ canvasLayer, textLayer, annotationLayer }: Props) {
  const layerContainerRef = useRef<HTMLDivElement>(null);

  // event listener for text range selection
  const handleTextRangeSelection = (event: MouseEvent) => {
    const selection = window.getSelection();
    console.log("> selection");
    console.log(selection);

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      console.log("> range");
      console.log(range);

      console.log("> range.getBoundingClientRect ");
      console.log(range.getClientRects());

      const parentRect = textLayer!.getBoundingClientRect();

      const rects = Array.from(range.getClientRects())
        .map((rect) => ({
          left: rect.left - parentRect.left,
          top: rect.top - parentRect.top,
          width: rect.width,
          height: rect.height,
        }))
        .filter(
          (rect) =>
            rect.width > 0 && rect.height > 0 && rect.left > 0 && rect.top > 0
        );

      console.log("> rects");
      console.log(rects);

      for (const rect of rects) {
        drawRect(rect);
      }
    }
  };

  const drawRect = (rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  }) => {
    const ctx = (annotationLayer as HTMLCanvasElement).getContext("2d");
    if (!ctx) {
      throw new Error("无法获取annotationLayer上下文");
    }
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
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
      ></div>
    </div>
  );
}

export default PdfPageRender;
