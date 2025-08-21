export interface PdfAnnotations {
  reportId: number
  classId: number
  studentId: number
  operatorId: number
  createTime: string
  updateTime: string
  data: OnePageAnnotations[]
}

export interface OnePageAnnotations {
  pageNum: number
  annotations: OnePageAnnotationItem[]
}

export interface OnePageAnnotationItem {
  uniqueId: number
  annotationRuleId: number | string
  selectedText: string
  commentText: string
  group: Group[]
}

export interface Group {
  type: 'rect' | string
  options: RectOptions | Record<string, any>
}

export interface RectOptions {
  left: number
  top: number
  fill: string
  width: number
  height: number
}
