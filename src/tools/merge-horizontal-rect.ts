interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MergedLine {
  top: number;
  height: number;
  left: number;
  width: number;
}

/**
 * 将多个文本矩形合并为按行分组的矩形
 * @param rects 文本选区的矩形列表
 * @param tolerance 垂直方向容差，用于判断是否为同一行（比如 top 相差小于 5px 视为同一行）
 * @returns 合并后的行矩形数组
 */
function mergeRectsIntoLines(
  rects: Rect[],
  tolerance: number = 5
): MergedLine[] {
  if (rects.length === 0) return [];

  // 1. 按 top 排序
  const sorted = [...rects].sort((a, b) => a.top - b.top);

  const lines: MergedLine[] = [];

  for (const rect of sorted) {
    const right = rect.left + rect.width;

    // 2. 尝试合并到现有行
    const existingLine = lines.find(
      (line) =>
        Math.abs(rect.top - line.top) <= tolerance &&
        Math.abs(rect.height - line.height) <= tolerance
    );

    if (existingLine) {
      // 合并：更新 left 和 right
      existingLine.left = Math.min(existingLine.left, rect.left);
      const currentRight = Math.max(
        existingLine.left + existingLine.width,
        right
      );
      existingLine.width = currentRight - existingLine.left;
    } else {
      // 创建新行
      lines.push({
        top: rect.top,
        height: rect.height,
        left: rect.left,
        width: rect.width,
      });
    }
  }

  return lines;
}

export { mergeRectsIntoLines };
