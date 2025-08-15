import styles from "./styles/pdf-page-render.module.scss";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { ToolContext } from "@/pages/Viewer/context/ToolContext";
import { mergeRectsIntoLines } from "@/tools/merge-horizontal-rect";
import { crossBase64Image, eraserBase64Image } from "./data/base64-image";

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
          comment: {
            text: "你这中水平好意思毕业？你在外面别说我是你的导师。",
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
          comment: {
            text: "你在干嘛？",
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
  const renderAnnotations = useCallback(() => {
    if (!fabricCanvas.current) return;

    fabricCanvas.current?.clear();

    const getYPosition = (
      target: fabric.Object,
      labelLeft: number,
      labelHeight: number
    ): { y: number } => {
      if (!fabricCanvas.current) return { y: 0 };

      const gap = 5;
      const targetTop = target.getBoundingRect().top;
      const targetCenterY = targetTop + target.getBoundingRect().height / 2;

      // Find all textboxes in the same column
      const labelsAtSameLeft = fabricCanvas.current
        .getObjects()
        .filter((obj) => {
          if (!(obj instanceof fabric.Textbox)) return false;
          const bbox = obj.getBoundingRect();
          return Math.abs(bbox.left - labelLeft) < 1;
        })
        .map((obj) => obj.getBoundingRect())
        .sort((a, b) => a.top - b.top); // Sort by Y position

      // Helper function to check if a position overlaps with any existing label
      const hasOverlap = (y: number): boolean => {
        return labelsAtSameLeft.some(
          (bbox) =>
            y < bbox.top + bbox.height + gap && y + labelHeight + gap > bbox.top
        );
      };

      // Helper function to find available positions
      const findAvailablePositions = (): number[] => {
        const positions: number[] = [];

        // Try the target position first
        if (!hasOverlap(targetTop)) {
          positions.push(targetTop);
        }

        // Add positions above each existing label
        labelsAtSameLeft.forEach((bbox) => {
          const positionAbove = bbox.top - labelHeight - gap;
          if (positionAbove >= 0 && !hasOverlap(positionAbove)) {
            positions.push(positionAbove);
          }
        });

        // Add positions below each existing label
        labelsAtSameLeft.forEach((bbox) => {
          const positionBelow = bbox.top + bbox.height + gap;
          if (!hasOverlap(positionBelow)) {
            positions.push(positionBelow);
          }
        });

        // If no labels exist or no good positions found, add some default positions
        if (positions.length === 0) {
          // Try positions around the target
          for (let offset = 0; offset <= 200; offset += 20) {
            const abovePos = targetTop - offset;
            const belowPos = targetTop + offset;

            if (abovePos >= 0 && !hasOverlap(abovePos)) {
              positions.push(abovePos);
            }
            if (!hasOverlap(belowPos)) {
              positions.push(belowPos);
            }
          }
        }

        return positions;
      };

      const availablePositions = findAvailablePositions();

      if (availablePositions.length === 0) {
        // Fallback: place at the bottom of all existing labels
        const lowestLabel = labelsAtSameLeft.reduce(
          (lowest, bbox) =>
            bbox.top + bbox.height > lowest ? bbox.top + bbox.height : lowest,
          targetTop
        );
        return { y: lowestLabel + gap };
      }

      // Find the position closest to target center Y
      const bestPosition = availablePositions.reduce((best, current) => {
        const currentCenterY = current + labelHeight / 2;
        const bestCenterY = best + labelHeight / 2;

        const currentDistance = Math.abs(currentCenterY - targetCenterY);
        const bestDistance = Math.abs(bestCenterY - targetCenterY);

        return currentDistance < bestDistance ? current : best;
      });

      return { y: bestPosition };
    };

    const connectLabel = (target: fabric.Object, label: fabric.Textbox) => {
      const canvas = fabricCanvas.current;
      if (!canvas) return;

      // 获取 target 右上角
      const targetRight = target.getCoords()[1]; // topRight
      // 获取 label 左上角
      const labelLeftTop = label.getBoundingRect();

      // 创建 line
      const line = new fabric.Line(
        [
          targetRight.x,
          targetRight.y + target.getBoundingRect().height / 2, // target 中点Y
          labelLeftTop.left,
          labelLeftTop.top + label.getBoundingRect().height / 2, // label 中点Y
        ],
        {
          stroke: "blue",
          strokeWidth: 1,
          selectable: false,
          evented: false,
        }
      );

      fabricCanvas.current!.add(line);
      fabricCanvas.current!.sendObjectToBack(line); // 让线在最底层

      // 当 target 或 label 移动时更新 line
      const updateLine = () => {
        const tRect = target.getBoundingRect();
        const lRect = label.getBoundingRect();

        line.set({
          x1: tRect.left + tRect.width, // target 右边
          y1: tRect.top + tRect.height / 2,
          x2: lRect.left, // label 左边
          y2: lRect.top + lRect.height / 2,
        });
        canvas.requestRenderAll();
      };

      target.on("moving", updateLine);
      label.on("moving", updateLine);
    };

    annotationData.forEach((annotation) => {
      annotation.group.forEach((item: any) => {
        if (item.type === "rect") {
          const rect = new fabric.Rect({
            left: item.options.left,
            top: item.options.top,
            fill: item.options.fill,
            width: item.options.width,
            height: item.options.height,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            metaData: {
              ...annotation,
            },
          } as any);
          const { x, y } = rect.getCoords()[1];
          const commentIcon = new fabric.FabricText("💬", {
            left: x - 20,
            top: y - 16,
            fontSize: 16,
            selectable: false,
            fill: "transparent",
            evented: false,
            hoverCursor: "pointer",
          });

          commentIcon.on("mousedown", () => {
            const targetAnnotation = annotationData.find(
              (ann) => ann.id === annotation.id
            );
            if (!targetAnnotation) return;

            const target = targetAnnotation.group?.[0];
            if (!target) return;

            if (!target.comment) {
              target.comment = {
                text: "",
              };
            }

            if (targetAnnotation.group[0].comment.text) {
              targetAnnotation.group[0].comment = {
                text: "",
              };
            } else {
              targetAnnotation.group[0].comment = {
                text: "你真牛啊！这论文是院士帮你写的吧？",
              };
            }

            setAnnotationData([...annotationData]);
            fabricCanvas.current?.renderAll();
          });

          fabricCanvas.current?.add(rect);
          fabricCanvas.current?.add(commentIcon);

          // render comment
          if (item.comment && item.comment.text) {
            const labelWidth = 120;
            const labelLeft = viewSize.width - 130;
            const tempLabel = new fabric.Textbox(item.comment.text, {
              width: labelWidth,
              fontSize: 12,
              splitByGrapheme: true,
              textAlign: "justify-left",
            });
            const tempLabelHeight = tempLabel.getBoundingRect().height;
            const { y } = getYPosition(rect, labelLeft, tempLabelHeight);
            const label = new fabric.Textbox(item.comment.text, {
              top: y,
              left: labelLeft,
              width: labelWidth,
              fontSize: 12,
              fill: "red",
              splitByGrapheme: true,
              textAlign: "justify-left",
            });

            fabricCanvas.current!.add(label);
            connectLabel(rect, label);
          }

          rect.on("selected", () => {
            commentIcon.set({
              fill: "red",
              evented: true,
            });
          });

          rect.on("deselected", () => {
            commentIcon.set({
              fill: "transparent",
              evented: false,
            });
          });
        }
      });
    });

    fabricCanvas.current?.renderAll();
  }, [annotationData]);

  // Handle erasing annotations
  const handleErase = (event: any) => {
    const target = event.target;

    if (!target) return;
    console.log("Erase target:", target);

    if (!target.metaData?.id) return;

    const id = target.metaData.id;
    const elementsWithTheSameId = fabricCanvas.current
      ?.getObjects()
      .filter((obj) => {
        return (obj as any).metaData?.id === id;
      });

    if (elementsWithTheSameId && elementsWithTheSameId.length > 1) {
      const tempSelection = new fabric.ActiveSelection(elementsWithTheSameId, {
        canvas: fabricCanvas.current!,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
      });
      fabricCanvas.current?.setActiveObject(tempSelection);
      tempSelection.forEachObject((obj) => {
        fabricCanvas.current?.remove(obj);
      });
      fabricCanvas.current?.discardActiveObject();
      fabricCanvas.current?.requestRenderAll();
    } else {
      fabricCanvas.current?.setActiveObject(target);
      fabricCanvas.current?.remove(target);
    }

    fabricCanvas.current?.requestRenderAll();
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
  }, [viewSize, imageCanvas, textDiv, setFabricCanvasPointerEvents]);

  useEffect(() => {
    renderAnnotations();
  }, [renderAnnotations]);

  useEffect(() => {
    document.removeEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseUp]);

  useEffect(() => {
    if (!fabricCanvas.current) return;

    if (
      toolCtx?.currentTool.id === "cursor" ||
      toolCtx?.currentTool.id === "brush"
    ) {
      setFabricCanvasPointerEvents("none");
    } else {
      setFabricCanvasPointerEvents("auto");
    }

    // reset cursor styles
    textDiv.classList.remove(styles.cursorDefault);
    textDiv.classList.remove(styles.cursorBrush);
    textDiv.classList.remove(styles.cursorCross);
    fabricCanvas.current.hoverCursor = "auto";
    fabricCanvas.current.defaultCursor = "auto";
    enableGroupClickDelete(false);

    if (toolCtx?.currentTool.id === "cursor") {
      textDiv.classList.add(styles.cursorDefault);
    }

    if (toolCtx?.currentTool.id === "brush") {
      textDiv.classList.add(styles.cursorBrush);
    }

    if (toolCtx?.currentTool.id === "rectangle") {
      fabricCanvas.current.hoverCursor = `url(${crossBase64Image}) 8 8, auto`;
      fabricCanvas.current.defaultCursor = `url(${crossBase64Image}) 8 8, auto`;
    }

    if (toolCtx?.currentTool.id === "eraser") {
      fabricCanvas.current.hoverCursor = `url(${eraserBase64Image}) 8 8, auto`;
      fabricCanvas.current.defaultCursor = `url(${eraserBase64Image}) 8 8, auto`;
      enableGroupClickDelete();
    }
  }, [
    toolCtx?.currentTool,
    setFabricCanvasPointerEvents,
    enableGroupClickDelete,
    textDiv.classList,
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
