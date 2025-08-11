import styles from "./styles/viewer.module.scss";
import PageTitle from "./components/PageTitle/PageTitle";
import Toolbar from "./components/Toolbar/Toolbar";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min?url";
import { useEffect, useState } from "react";
import PdfPageRender from "@/components/PdfPageRender/PdfPageRender";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const fileUrl =
  "http://36.134.52.8:9000/smart-report-file/c718d4a6908a4805a84eefd746930c3f.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=admin%2F20250811%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250811T091629Z&X-Amz-Expires=7200&X-Amz-SignedHeaders=host&X-Amz-Signature=e9e4a31a220a56027cc77ae307fe10ffcd38d36c18223ed3e8fc9e7a47ea7187";

function Viewer() {
  const [canvasLayers, setCanvasLayers] = useState<HTMLCanvasElement[]>([]);
  const [textLayers, setTextLayers] = useState<HTMLDivElement[]>([]);
  const [annotationLayers, setAnnotationLayers] = useState<HTMLCanvasElement[]>([]);

  const loadPdf = async (url: string) => {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;

    console.log("> pdf pages");
    console.log(pdf.numPages);

    const pages: HTMLCanvasElement[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

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

      pages.push(canvas);
    }

    setCanvasLayers(pages);
  };

  useEffect(() => {
    loadPdf(fileUrl).catch((error) => {
      console.error("> loadPdf error");
      console.error(error);
    });
  }, [fileUrl]);

  useEffect(() => {
    console.log("> loadPdf successfully");
    console.log(canvasLayers);
  }, [canvasLayers]);

  return (
    <div className={styles.viewer}>
      <div className={styles.pageTitleContainer}>
        <PageTitle />
      </div>

      <div className={styles.toolbarContainer}>
        <Toolbar />
      </div>

      <div className={styles.viewerContainer}>
        {canvasLayers.map((page, index) => (
          <PdfPageRender
            key={index}
            canvasLayer={page}
            textLayer={undefined}
            annotationLayer={undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default Viewer;
