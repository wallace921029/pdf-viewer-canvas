import styles from './styles/viewer.module.scss'
import 'pdfjs-dist/web/pdf_viewer.css'

import PageTitle from './components/PageTitle/PageTitle'
import Toolbar from './components/Toolbar/Toolbar'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min?url'
import { useEffect, useState } from 'react'
import PdfPageRender from '@/components/PdfPageRender/PdfPageRender'
import demoFile from '@/assets/冯少桐-07班-循环和呼吸功能调节综合实验.pdf?url'
import type { PageLayer } from './types'
import type { Annotation } from '@/types/annotation'
import PresetComment from './components/PresetComment/PresetComment'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

function Viewer() {
  const fileUrl = demoFile

  const [viewSize, setViewSize] = useState({ width: 0, height: 0 })
  const [pageLayers, setPageLayers] = useState<PageLayer[]>([])
  const [annotationData, setAnnotationData] = useState<Annotation[][]>([
    [
      {
        id: 1755168610666,
        selectedText: '制解析',
        group: [
          {
            type: 'rect',
            options: {
              left: 427.03761291503906,
              top: 595.7291870117188,
              fill: 'rgba(255, 0, 0, .3)',
              width: 48.6417236328125,
              height: 18,
              hasControls: false
            },
            comment: {
              annotationRuleId: 100,
              text: '你这中水平好意思毕业？你在外面别说我是你的导师。'
            }
          }
        ]
      },
      {
        id: Date.now(),
        selectedText: '家兔气管插管',
        group: [
          {
            type: 'rect',
            options: {
              left: 483.79754638671875 * 1.5,
              top: 397.57733154296875 * 1.5,
              fill: 'rgba(148, 0, 211, .3)',
              width: 21.188995361328125 * 1.5,
              height: 10.5 * 1.5
            },
            comment: {
              annotationRuleId: 101,
              text: '你在干嘛？'
            }
          },
          {
            type: 'rect',
            options: {
              left: 90.0999984741211 * 1.5,
              top: 420.9773254394531 * 1.5,
              fill: 'rgba(148, 0, 211, .3)',
              width: 42.37899835205078 * 1.5,
              height: 10.5 * 1.5
            }
          }
        ]
      }
    ]
  ])

  const handleSave = () => {
    console.log('> annotationData', annotationData)
  }

  // load PDF content and render pages
  const loadPdf = async (url: string) => {
    const loadingTask = pdfjsLib.getDocument(url)
    const pdf = await loadingTask.promise

    const tempPageLayers: PageLayer[] = []
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.5 })
      setViewSize({ width: viewport.width, height: viewport.height })

      // image layer
      const pageImageCanvas = document.createElement('canvas')
      const context = pageImageCanvas.getContext('2d')
      if (!context) {
        throw new Error('无法获取canvas上下文')
      }
      pageImageCanvas.height = viewport.height
      pageImageCanvas.width = viewport.width

      await page.render({
        canvasContext: context,
        canvas: pageImageCanvas,
        viewport: viewport
      }).promise

      // text layer
      const pageTextDiv = document.createElement('div')
      pageTextDiv.style.position = 'absolute'
      pageTextDiv.style.left = '0'
      pageTextDiv.style.top = '0'

      const textContent = await page.getTextContent()

      const textLayer = new pdfjsLib.TextLayer({
        textContentSource: textContent,
        container: pageTextDiv,
        viewport: viewport
      })
      await textLayer.render()

      tempPageLayers.push({
        imageCanvas: pageImageCanvas,
        textDiv: pageTextDiv
      })
    }

    setPageLayers(tempPageLayers)
  }

  useEffect(() => {
    loadPdf(fileUrl).catch((error) => {
      console.error('> PDF loading error')
      console.error(error)
    })
  }, [fileUrl])

  // show preset comment
  const [showPresetComment, setShowPresetComment] = useState(false)
  const [focusedAnnotation, setFocusedAnnotation] = useState<Annotation | null>(
    null
  )

  return (
    <div className={`${styles.viewer}`}>
      <div className={styles.pageTitleContainer}>
        <PageTitle />
      </div>

      <div className={styles.toolbarContainer}>
        <Toolbar onSave={handleSave} />
      </div>

      <div className={`${styles.bodyContainer}`}>
        <div
          className={`${styles.viewerContainer} pdfViewer`}
          id='viewer'
        >
          {pageLayers.map((pageLayer, pageLayerIndex) => (
            <PdfPageRender
              key={pageLayerIndex}
              viewSize={viewSize}
              imageCanvas={pageLayer.imageCanvas}
              textDiv={pageLayer.textDiv}
              annotationData={annotationData[pageLayerIndex] || []}
              setAnnotationData={(newAnnotationData) => {
                setAnnotationData((prev) => {
                  const updated = [...prev]
                  updated[pageLayerIndex] = newAnnotationData
                  return updated
                })
              }}
              setShowPresetComment={setShowPresetComment}
              setFocusedAnnotation={setFocusedAnnotation}
            />
          ))}
        </div>

        {showPresetComment && (
          <div className={styles.presetAnnotationContainer}>
            <PresetComment
              focusedAnnotation={focusedAnnotation}
              setFocusedAnnotation={setFocusedAnnotation}
              setShowPresetComment={setShowPresetComment}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Viewer
