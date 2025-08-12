import styles from "./styles/viewer.module.scss";

import PageTitle from "./components/PageTitle/PageTitle";
import Toolbar from "./components/Toolbar/Toolbar";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min?url";
import { useEffect, useState } from "react";
import PdfPageRender from "@/components/PdfPageRender/PdfPageRender";
import demoFile from "@/assets/demo.pdf?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const fileUrl = demoFile;

function Viewer() {
  const [pdfLayers, setPdfLayers] = useState<
    {
      canvasLayers: HTMLCanvasElement;
      textLayers?: HTMLDivElement;
      annotationLayers?: HTMLCanvasElement;
    }[]
  >([]);

  // load PDF content and render pages
  const loadPdf = async (url: string) => {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;

    console.log("> pdf pages");
    console.log(pdf.numPages);

    const pages: {
      canvasLayers: HTMLCanvasElement;
      textLayers?: HTMLDivElement;
      annotationLayers?: HTMLCanvasElement;
    }[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      // canvas layer
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("无法获取canvas上下文");
      }
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        canvas: canvas,
        viewport: viewport,
      }).promise;

      // text layer
      const textLayerDiv = document.createElement("div");
      textLayerDiv.style.position = "absolute";
      textLayerDiv.style.left = "0";
      textLayerDiv.style.top = "0";
      textLayerDiv.style.width = `${viewport.width}px`;
      textLayerDiv.style.height = `${viewport.height}px`;

      const textContent = await page.getTextContent();

      const textLayer = new pdfjsLib.TextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport: viewport,
      });

      await textLayer.render();

      // annotation layer
      const annotationLayerCanvas = document.createElement("canvas");
      const annotationLayerContext = annotationLayerCanvas.getContext("2d");
      if (!annotationLayerContext) {
        throw new Error("无法获取annotationLayerCanvas上下文");
      }
      annotationLayerCanvas.height = viewport.height;
      annotationLayerCanvas.width = viewport.width;
      annotationLayerCanvas.style.pointerEvents = "none";

      pages.push({
        canvasLayers: canvas,
        textLayers: textLayerDiv,
        annotationLayers: annotationLayerCanvas,
      });
    }

    setPdfLayers(pages);
  };

  useEffect(() => {
    loadPdf(fileUrl).catch((error) => {
      console.error("> loadPdf error");
      console.error(error);
    });
  }, [fileUrl]);

  useEffect(() => {
    console.log("> loadPdf successfully");
    console.log(pdfLayers);
  }, [pdfLayers]);

  return (
    <div className={styles.viewer}>
      <div className={styles.pageTitleContainer}>
        <PageTitle />
      </div>

      <div className={styles.toolbarContainer}>
        <Toolbar />
      </div>

      <div className={styles.viewerContainer}>
        {pdfLayers.map((pdfLayer, pdfLayerIndex) => (
          <PdfPageRender
            key={pdfLayerIndex}
            canvasLayer={pdfLayer.canvasLayers}
            textLayer={pdfLayer.textLayers}
            annotationLayer={pdfLayer.annotationLayers}
          />
        ))}
      </div>
    </div>
  );
}

export default Viewer;
