import { IconRight } from '@arco-design/web-react/icon'
import styles from './styles/preset-comment.module.scss'
import type React from 'react'
import type { Annotation } from '@/types/annotation'

interface Props {
  focusedAnnotation: Annotation | null
  setFocusedAnnotation: React.Dispatch<React.SetStateAction<Annotation | null>>
  setShowPresetComment: React.Dispatch<React.SetStateAction<boolean>>
}

function PresetComment({
  focusedAnnotation,
  setFocusedAnnotation,
  setShowPresetComment
}: Props) {
  const presetComments = [
    {
      annotationRuleId: 1,
      comment: '我们家王源就是牛！'
    },
    {
      annotationRuleId: 2,
      comment: '王源的歌真好听！'
    },
    {
      annotationRuleId: 3,
      comment: '王源，伯克利KTV音乐才子，国服牛叫第一人，素有中国天籁牛嗓之称~'
    }
  ]

  const handleCommentClick = (comment: string) => {
    const newAnnotation = {
      ...focusedAnnotation!
    }
    newAnnotation.group![0].comment!.text = comment
    setFocusedAnnotation(newAnnotation)
    setShowPresetComment(false)
  }

  return (
    <div className={styles.presetComment}>
      <div className={styles.header}>
        <div>预设评论</div>
        <IconRight onClick={() => setShowPresetComment(false)} />
      </div>

      <div className={styles.selectedTextBox}>
        <fieldset title={focusedAnnotation?.selectedText}>
          <legend>Selected Text</legend>
          <div>{focusedAnnotation?.selectedText}</div>
        </fieldset>
      </div>

      <div className={styles.commentBox}>
        <ul>
          {presetComments.map((pre, preIndex) => {
            return (
              <li
                key={pre.annotationRuleId}
                className={styles.commentItem}
              >
                <span>{pre.comment}</span>
                <span onClick={() => handleCommentClick(pre.comment)}>🆗</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default PresetComment
