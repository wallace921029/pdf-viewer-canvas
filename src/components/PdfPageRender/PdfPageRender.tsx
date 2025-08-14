import styles from "./styles/pdf-page-render.module.scss";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { ToolContext } from "@/pages/Viewer/context/ToolContext";
import { mergeRectsIntoLines } from "@/tools/merge-horizontal-rect";

interface Props {
  viewSize: { width: number; height: number };
  imageCanvas: HTMLCanvasElement;
  textDiv: HTMLDivElement;
}

function PdfPageRender({ viewSize, imageCanvas, textDiv }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const [annotationData, setAnnotationData] = useState<any[]>([
    {
      id: 1755168610666,
      selectedText: "制解析",
      group: [
        {
          type: "rect",
          options: {
            left: 427.03761291503906,
            top: 595.7291870117188,
            fill: "rgba(255, 0, 0, .3)",
            width: 48.6417236328125,
            height: 18,
            hasControls: false,
          },
        },
      ],
    },
    {
      id: Date.now(),
      selectedText: "家兔气管插管",
      group: [
        {
          type: "rect",
          options: {
            left: 483.79754638671875 * 1.5,
            top: 397.57733154296875 * 1.5,
            fill: "rgba(148, 0, 211, .3)",
            width: 21.188995361328125 * 1.5,
            height: 10.5 * 1.5,
          },
        },
        {
          type: "rect",
          options: {
            left: 90.0999984741211 * 1.5,
            top: 420.9773254394531 * 1.5,
            fill: "rgba(148, 0, 211, .3)",
            width: 42.37899835205078 * 1.5,
            height: 10.5 * 1.5,
          },
        },
      ],
    },
  ]);

  const toolCtx = useContext(ToolContext);

  // Set fabric canvas pointer events
  const setFabricCanvasPointerEvents = useCallback((value: "auto" | "none") => {
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
  }, []);

  // Draw rectangle on annotation layer
  const drawAnnotations = useCallback(() => {
    if (!fabricCanvas.current) return;

    fabricCanvas.current?.clear();

    annotationData.forEach((annotation) => {
      const group = new fabric.Group([], {
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        meta: {
          ...annotation,
        },
      } as any);

      annotation.group.forEach((item: any) => {
        if (item.type === "rect") {
          const rect = new fabric.Rect({
            left: item.options.left,
            top: item.options.top,
            fill: item.options.fill,
            width: item.options.width,
            height: item.options.height,
            hasControls: false,
          });
          group.add(rect);
        }
      });
      fabricCanvas.current?.add(group);
    });

    fabricCanvas.current?.renderAll();
  }, [annotationData]);

  // Handle erasing annotations
  const handleErase = (event: any) => {
    const target = event.target;

    console.log("Erase target:", target, event);
    if (target && target.type === "group") {
      // fabricCanvas.current?.remove(target);
      // fabricCanvas.current?.discardActiveObject();
      // fabricCanvas.current?.requestRenderAll();
      // // Clear selection
      // const selection = document.getSelection();
      // if (selection) {
      //   selection.removeAllRanges();
      // }
    }
  };

  const enableGroupClickDelete = useCallback((enable = true) => {
    if (!fabricCanvas.current) return;

    fabricCanvas.current.off("mouse:down", handleErase);

    if (enable) fabricCanvas.current.on("mouse:down", handleErase);
  }, []);

  // for selecting text
  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (toolCtx?.currentTool.id !== "brush") return;

      // check if the click position is within the textDiv
      if (!textDiv.contains(event.target as Node)) return;

      const selection = document.getSelection();

      if (!selection) return;

      // 1. 检查是否有选中文本
      if (!selection.rangeCount || selection.toString().length === 0) {
        console.log("No text selected");
        return;
      }

      // 2. 获取选区的 Range
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      // 3. 检查选区是否完全在 textDiv 内部
      if (!textDiv.contains(range.commonAncestorContainer)) {
        console.log("Out of page.");
        return;
      }

      // 4. 获取选区的所有视觉矩形 (ClientRectList)
      // 这是关键！getClientRects() 返回一个类似数组的 ClientRectList
      const clientRects = range.getClientRects();

      // 5. 获取 textDiv 相对于其包含块（通常是视口）的边界
      // 我们需要这个来将选区矩形的坐标转换为相对于 textDiv 的坐标
      const textDivRect = textDiv.getBoundingClientRect();

      // 6. 存储每一块的信息
      const linesInfo = [];

      // 7. 遍历每一个矩形 (每个矩形通常代表选区的一行或一个片段)
      for (let i = 0; i < clientRects.length; i++) {
        const rect = clientRects[i];

        // 8. 计算相对于 textDiv 的坐标
        // 减去 textDiv 在视口中的 left/top
        const relativeLeft = rect.left - textDivRect.left;
        const relativeTop = rect.top - textDivRect.top;

        // 9. 计算相对于 textDiv 的宽高
        // 宽度和高度本身是绝对的，但坐标是相对的
        const width = rect.width;
        const height = rect.height;

        // 10. 将信息存入数组
        // 你可以根据需要调整存储的属性
        if (width > 0) {
          linesInfo.push({
            left: relativeLeft,
            top: relativeTop,
            width: width,
            height: height,
          });
        }
      }

      // 11. 输出或使用结果
      const mergedLines = mergeRectsIntoLines(linesInfo, 5);
      const rectGroup = {
        id: Date.now(),
        selectedText,
        group: mergedLines.map((line) => {
          console.log("toolCtx.currentTool.color", toolCtx.currentTool.color);
          return {
            type: "rect",
            options: {
              left: line.left,
              top: line.top,
              fill: toolCtx.currentTool.color,
              width: line.width,
              height: line.height,
              hasControls: false,
            },
          };
        }),
      };

      setAnnotationData((prevValue) => [...prevValue, rectGroup]);
    },
    [textDiv, toolCtx]
  );

  useEffect(() => {
    if (!containerRef.current) return;

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
      preserveObjectStacking: true, // lets objects keep their order
      subTargetCheck: true, // checks for objects below
    });
    (fabricCanvas.current as any).subTargetCheck = true;
    fabricCanvas.current.wrapperEl.style.position = "absolute";
    fabricCanvas.current.wrapperEl.style.left = "0";
    fabricCanvas.current.wrapperEl.style.top = "0";
    setFabricCanvasPointerEvents("none");
  }, [viewSize, imageCanvas, textDiv]);

  useEffect(() => {
    drawAnnotations();
  }, [drawAnnotations]);

  useEffect(() => {
    document.removeEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseUp]);

  useEffect(() => {
    if (
      toolCtx?.currentTool.id === "cursor" ||
      toolCtx?.currentTool.id === "brush"
    ) {
      setFabricCanvasPointerEvents("none");
    } else {
      setFabricCanvasPointerEvents("auto");
    }

    if (toolCtx?.currentTool.id === "eraser") {
      enableGroupClickDelete();
    } else {
      enableGroupClickDelete(false);
    }
  }, [
    toolCtx?.currentTool,
    setFabricCanvasPointerEvents,
    enableGroupClickDelete,
  ]);

  return (
    <div
      className={`${styles.pdfPageRender}`}
      style={{ width: `${viewSize.width}px`, height: `${viewSize.height}px` }}
      ref={containerRef}
    />
  );
}

export default PdfPageRender;
