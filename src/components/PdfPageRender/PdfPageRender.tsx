import styles from "./styles/pdf-page-render.module.scss";
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import * as lodash from "lodash";

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

  const [annotationData, setAnnotationData] = useState<any[]>([
    // {
    //   id: "1",
    //   group: [
    //     {
    //       type: "rect",
    //       options: {
    //         left: 100,
    //         top: 100,
    //         fill: "rgba(255, 0, 0, 0.5)",
    //         width: 50,
    //         height: 50,
    //         hasControls: false,
    //       },
    //     },
    //   ],
    // },
  ]);

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
  const drawAnnotations = () => {
    if (!fabricCanvas.current) return;

    const group = new fabric.Group();
    console.log("annotationData");
    console.log(annotationData);
    annotationData.forEach((annotation) => {
      annotation.group.forEach((item) => {
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
    });
    fabricCanvas.current?.clear();
    fabricCanvas.current?.add(group);
    fabricCanvas.current?.renderAll();
  };

  const enableGroupClickDelete = () => {
    if (!fabricCanvas.current) return;
    console.log("123");
    fabricCanvas.current.on("mouse:down", (event) => {
      const target = event.target;
      console.log("> event.target", event.target);
      if (target && target.type === "group") {
        fabricCanvas.current?.remove(target);
        fabricCanvas.current?.discardActiveObject();
        fabricCanvas.current?.requestRenderAll();
      }
    });
  };

  const handleMouseUp = () => {
    const selection = document.getSelection();

    if (!selection) return;

    // 1. 检查是否有选中文本
    if (!selection.rangeCount || selection.toString().length === 0) {
      console.log("No text selected");
      // 可以在这里触发“取消选中”逻辑
      return;
    }

    // 2. 获取选区的 Range
    const range = selection.getRangeAt(0);

    // 3. 检查选区是否完全在 textDiv 内部
    if (!textDiv.contains(range.commonAncestorContainer)) {
      console.log("Selection is not within the target container");
      return;
    }

    // 4. 获取选区的所有视觉矩形 (ClientRectList)
    // 这是关键！getClientRects() 返回一个类似数组的 ClientRectList
    const clientRects = range.getClientRects();

    // 5. 获取 textDiv 相对于其包含块（通常是视口）的边界
    // 我们需要这个来将选区矩形的坐标转换为相对于 textDiv 的坐标
    const textDivRect = textDiv.getBoundingClientRect();

    // 6. 存储每一行的信息
    const linesInfo = [];

    // 7. 遍历每一个矩形 (每个矩形通常代表选区的一行或一个片段)
    for (let i = 0; i < clientRects.length; i++) {
      const rect = clientRects[i];

      // 8. 计算相对于 textDiv 的坐标
      // 减去 textDiv 在视口中的 left/top
      const relativeLeft = rect.left - textDivRect.left;
      const relativeTop = rect.top - textDivRect.top;
      const relativeRight = rect.right - textDivRect.left;
      const relativeBottom = rect.bottom - textDivRect.top;

      // 9. 计算相对于 textDiv 的宽高
      // 宽度和高度本身是绝对的，但坐标是相对的
      const width = rect.width;
      const height = rect.height;

      // 10. 将信息存入数组
      // 你可以根据需要调整存储的属性
      linesInfo.push({
        index: i, // 行索引
        left: relativeLeft,
        top: relativeTop,
        right: relativeRight, // 有时 right 比 left + width 更精确（处理 sub-pixel）
        bottom: relativeBottom,
        width: width,
        height: height,
        // 可选：存储绝对坐标
        // absolute: { left: rect.left, top: rect.top, width, height }
      });
    }

    // 11. 输出或使用结果
    console.log("Selected lines info relative to textDiv:", linesInfo);
    const rectGroup = {
      id: "",
      group: linesInfo.map((line) => {
        return {
          type: "rect",
          options: {
            left: line.left,
            top: line.top,
            fill: "rgba(255, 0, 0, 0.5)",
            width: line.width,
            height: line.height,
            hasControls: false,
          },
        };
      }),
    };

    setAnnotationData((prevValue) => [...prevValue, rectGroup]);
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

  useEffect(() => {
    drawAnnotations();
  }, [annotationData, fabricCanvas]);

  useEffect(() => {
    enableGroupClickDelete();

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
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
