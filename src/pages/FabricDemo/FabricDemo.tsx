import styles from './styles/fabric-demo.module.scss'

import { useEffect, useRef } from 'react'
import * as fabric from 'fabric'

function FabricDemo() {
  const containerRef = useRef<HTMLDivElement>(null)

  const canvas: HTMLCanvasElement = document.createElement('canvas')
  canvas.style.pointerEvents = 'none'

  useEffect(() => {
    containerRef.current?.appendChild(canvas)

    const fabricCanvas = new fabric.Canvas(canvas, {
      backgroundColor: 'green',
      width: 800,
      height: 600,
      selection: true, // Enable selection
      interactive: true // Ensure interactivity
    })

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'rgba(255, 0, 0, 0.5)',
      width: 50,
      height: 50,
      selectable: true,
      moveable: true,
      hasControls: true,
      evented: true // Make sure events are enabled
    })

    fabricCanvas.add(rect)
    fabricCanvas.renderAll()

    // Enable pointer events after a slight delay to ensure fabric has initialized
    setTimeout(() => {
      const canvasElement = document.getElementById('canvas')
      if (canvasElement) {
        canvasElement.style.pointerEvents = 'auto'
      }

      // Also enable on the fabric canvas wrapper and upper canvas
      if (fabricCanvas.upperCanvasEl) {
        fabricCanvas.upperCanvasEl.style.pointerEvents = 'auto'
      }
      if (fabricCanvas.wrapperEl) {
        fabricCanvas.wrapperEl.style.pointerEvents = 'auto'
      }
    }, 0)

    return () => {
      // Cleanup function to dispose of canvas when component unmounts
      fabricCanvas.dispose()
    }
  }, [])

  return <div className={styles.fabricDemo} ref={containerRef}></div>
}

export default FabricDemo
