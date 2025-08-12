import styles from "./styles/viewer.module.scss";

import PageTitle from "./components/PageTitle/PageTitle";
import Toolbar from "./components/Toolbar/Toolbar";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min?url";
import { useEffect, useState } from "react";
import PdfPageRender from "@/components/PdfPageRender/PdfPageRender";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const fileUrl =
  "http://36.134.52.8:9000/smart-report-file/c718d4a6908a4805a84eefd746930c3f.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=admin%2F20250812%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250812T091251Z&X-Amz-Expires=7200&X-Amz-SignedHeaders=host&X-Amz-Signature=0536fbd26c8565ff3d77dd426d0bf9170e804162a946f3795d2b65352753f251";

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
