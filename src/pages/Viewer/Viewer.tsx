import styles from "./styles/viewer.module.scss";
import "pdfjs-dist/web/pdf_viewer.css";

import PageTitle from "./components/PageTitle/PageTitle";
import Toolbar from "./components/Toolbar/Toolbar";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min?url";
import { useEffect, useState } from "react";
import PdfPageRender from "@/components/PdfPageRender/PdfPageRender";
import demoFile from "@/assets/冯少桐-07班-循环和呼吸功能调节综合实验.pdf?url";
import type { PageLayer } from "./types";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

function Viewer() {
  const fileUrl = demoFile;

  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
  const [pageLayers, setPageLayers] = useState<PageLayer[]>([]);

  // load PDF content and render pages
  const loadPdf = async (url: string) => {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;

    const tempPageLayers: PageLayer[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      setViewSize({ width: viewport.width, height: viewport.height });

      // image layer
      const pageImageCanvas = document.createElement("canvas");
      const context = pageImageCanvas.getContext("2d");
      if (!context) {
        throw new Error("无法获取canvas上下文");
      }
      pageImageCanvas.height = viewport.height;
      pageImageCanvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        canvas: pageImageCanvas,
        viewport: viewport,
      }).promise;

      // text layer
      const pageTextDiv = document.createElement("div");
      pageTextDiv.style.position = "absolute";
      pageTextDiv.style.left = "0";
      pageTextDiv.style.top = "0";

      const textContent = await page.getTextContent();

      const textLayer = new pdfjsLib.TextLayer({
        textContentSource: textContent,
        container: pageTextDiv,
        viewport: viewport,
      });

      await textLayer.render();

      tempPageLayers.push({
        imageCanvas: pageImageCanvas,
        textDiv: pageTextDiv,
      });
    }

    setPageLayers(tempPageLayers);
  };

  useEffect(() => {
    loadPdf(fileUrl).catch((error) => {
      console.error("> PDF loading error");
      console.error(error);
    });
  }, [fileUrl]);

  return (
    <div className={`${styles.viewer}`}>
      <div className={styles.pageTitleContainer}>
        <PageTitle />
      </div>

      <div className={styles.toolbarContainer}>
        <Toolbar />
      </div>

      <div className={`${styles.viewerContainer} pdfViewer`} id="viewer">
        {pageLayers.map((pageLayer, pageLayerIndex) => (
          <PdfPageRender
            key={pageLayerIndex}
            viewSize={viewSize}
            imageCanvas={pageLayer.imageCanvas}
            textDiv={pageLayer.textDiv}
          />
        ))}
      </div>
    </div>
  );
}

export default Viewer;
