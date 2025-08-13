import styles from "./styles/pdf-page-render.module.scss";
import { useEffect, useRef } from "react";
import * as fabric from "fabric";

interface Props {
  viewSize: { width: number; height: number };
  imageCanvas: HTMLCanvasElement;
  textDiv: HTMLDivElement;
}

function PdfPageRender({ viewSize, imageCanvas, textDiv }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);

  const trashIconRef = useRef<fabric.FabricText | null>(null);
  const trashTargetRef = useRef<fabric.FabricObject | null>(null);

  const setFabricCanvasPointerEvents = (value: "auto" | "none") => {
    if (!fabricCanvas.current) return;

    if (fabricCanvas.current.lowerCanvasEl) {
      fabricCanvas.current.lowerCanvasEl.style.pointerEvents = value;
    }
    if (fabricCanvas.current.wrapperEl) {
      fabricCanvas.current.wrapperEl.style.pointerEvents = value;
    }
    if (fabricCanvas.current.upperCanvasEl) {
      fabricCanvas.current.upperCanvasEl.style.pointerEvents = value;
    }

  };

  // Draw rectangle on annotation layer
  const drawRect = () => {
    if (!fabricCanvas.current) return;
    // Enable pointer events on the annotation canvas for interaction
    if (fabricCanvas.current.lowerCanvasEl.parentElement) {
      fabricCanvas.current.lowerCanvasEl.parentElement.style.pointerEvents =
        "auto";
    }
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "rgba(255, 0, 0, 0.5)",
      width: 50,
      height: 50,
      hasControls: false,
    });
    fabricCanvas.current.add(rect);
    setFabricCanvasPointerEvents("auto");
    fabricCanvas.current.renderAll();
  };

  const showTrashIcon = (target: fabric.Object) => {
    console.log("|||||");

    if (!fabricCanvas.current) return;

    // Remove existing trash icon if any
    if (trashIconRef.current) {
      fabricCanvas.current.remove(trashIconRef.current);
    }

    // Calculate position for icon (above top-right corner of the object)
    const boundingRect = target.getBoundingRect();
    const iconLeft = boundingRect.left + boundingRect.width - 10;
    const iconTop = boundingRect.top - 20;

    // Create trash emoji icon
    const icon = new fabric.FabricText("❌", {
      left: iconLeft - 16,
      top: iconTop + 16,
      fontSize: 16,
      selectable: false,
      hoverCursor: "pointer",
      evented: true, // allow click events
    });

    trashIconRef.current = icon;
    trashTargetRef.current = target;

    fabricCanvas.current.add(icon);
    fabricCanvas.current.bringObjectToFront(icon);
    fabricCanvas.current.renderAll();
  };

  const hideTrashIcon = () => {
    console.log("-----");
    if (fabricCanvas.current && trashIconRef.current) {
      fabricCanvas.current.remove(trashIconRef.current);
      trashIconRef.current = null;
    }
    trashTargetRef.current = null;
  };

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

      // annotation layer
      const annotationCanvas = document.createElement("canvas");
      annotationCanvas.width = viewSize.width;
      annotationCanvas.height = viewSize.height;
      annotationCanvas.style.position = "absolute";
      annotationCanvas.style.left = "0";
      annotationCanvas.style.top = "0";
      annotationCanvas.style.pointerEvents = "none";
      containerRef.current.appendChild(annotationCanvas);

      fabricCanvas.current = new fabric.Canvas(annotationCanvas, {
        width: viewSize.width,
        height: viewSize.height,
      });
      fabricCanvas.current.wrapperEl.style.position = "absolute";
      fabricCanvas.current.wrapperEl.style.left = "0";
      fabricCanvas.current.wrapperEl.style.top = "0";
      setFabricCanvasPointerEvents("none");

      // Events
      fabricCanvas.current.on("mouse:over", (e) => {
        if (e.target && e.target.type === "rect") {
          showTrashIcon(e.target as fabric.FabricObject);
        }
      });

      fabricCanvas.current.on("mouse:out", (e) => {
        if (e.target && e.target.type === "rect") {
          hideTrashIcon();
        }
      });

      fabricCanvas.current.on("mouse:down", (e) => {
        if (trashIconRef.current && e.target === trashIconRef.current) {
          if (trashTargetRef.current) {
            fabricCanvas.current!.remove(trashTargetRef.current);
          }
          hideTrashIcon();
          setFabricCanvasPointerEvents("none");
          fabricCanvas.current!.renderAll();
        }
      });
    }
  }, [viewSize, imageCanvas, textDiv]);

  // Set up document click event listener once
  useEffect(() => {
    const handleClick = () => {
      drawRect();
    };
    document.addEventListener("dblclick", handleClick);

    return () => {
      document.removeEventListener("dblclick", handleClick);
    };
  }, []);

  return (
    <div
      className={`${styles.pdfPageRender}`}
      style={{ width: `${viewSize.width}px`, height: `${viewSize.height}px` }}
      ref={containerRef}
    />
  );
}

export default PdfPageRender;
