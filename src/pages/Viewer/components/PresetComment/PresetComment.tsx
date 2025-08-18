import { Button, Input } from '@arco-design/web-react'
import { IconRight } from '@arco-design/web-react/icon'
import styles from './styles/preset-comment.module.scss'
import type React from 'react'

interface Props {
  setShowPresetAnnotations: React.Dispatch<React.SetStateAction<boolean>>
}

function PresetComment({ setShowPresetAnnotations }: Props) {
  return (
    <div className={styles.presetComment}>
      {' '}
      <div className={styles.header}>
        <div>预设评论</div>
        <IconRight onClick={() => setShowPresetAnnotations(false)} />
      </div>
      <div className={styles.quickCommentBox}>
        <label>Quick Comment </label>
        <Input placeholder='Enter your comment...' size='small' />
        <Button type='primary' long size='small'>
          Leave Comment
        </Button>
      </div>
    </div>
  )
}

export default PresetComment
