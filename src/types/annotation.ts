export interface FabricElement {
  type: 'rect' | string // 目前例子里是 rect，可扩展
  options: {
    left: number
    top: number
    width: number
    height: number
    fill?: string
    hasControls?: boolean
    // 可根据需求继续扩展 Fabric 对象属性
  }
  comment?: {
    annotationRuleId: number | string
    text: string
  }
}

// 每个 annotation 类型
export interface Annotation {
  id: number
  selectedText: string
  group: FabricElement[]
}
