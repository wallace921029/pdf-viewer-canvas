import styles from './styles/toolbar.module.scss'

import cursorSVG from '@/assets/svg/cursor.svg'
import brushSVG from '@/assets/svg/brush.svg'
import rectangleSVG from '@/assets/svg/rectangle.svg'
import { Divider } from '@arco-design/web-react'
import { Fragment, useContext, useState } from 'react'
import Palette from './Palette'
import OtherActions from './OtherActions'
import eraserSVG from '@/assets/svg/eraser.svg'
import { ToolContext } from '../../context/ToolContext'

const toolItems = [
  { id: 'cursor', icon: cursorSVG, title: 'Cursor' },
  { id: 'brush', icon: brushSVG, title: 'Brush' },
  { id: 'rectangle', icon: rectangleSVG, title: 'Rectangle' },
  { id: 'eraser', icon: eraserSVG, title: 'Eraser' }
]

function Toolbar() {
  const [selectedTool, setSelectedTool] = useState('cursor')
  const [selectedColor, setSelectedColor] = useState('')

  const toolCtx = useContext(ToolContext)

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbox}>
        {toolItems.map((item) => (
          <Fragment key={item.id}>
            <div
              className={`${styles.toolboxItem} ${
                selectedTool === item.id ? styles.toolboxItemSelected : ''
              }`}
              title={item.title}
              onClick={() => {
                setSelectedTool(item.id)
                toolCtx?.setCurrentTool((prev) => ({ ...prev, id: item.id }))
              }}
            >
              <img src={item.icon} alt={item.id} />
            </div>
            <Divider type='vertical' />
          </Fragment>
        ))}
        <Palette setSelectedColor={setSelectedColor} />
        <Divider type='vertical' />
        <OtherActions />
      </div>
    </div>
  )
}

export default Toolbar
