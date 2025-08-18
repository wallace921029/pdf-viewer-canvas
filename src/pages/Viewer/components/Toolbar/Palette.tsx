import styles from './styles/palette.module.scss'

import { useContext, useEffect, useState } from 'react'
import paletteSVG from '@/assets/svg/palette.svg'
import { ToolContext } from '../../context/ToolContext'

interface Props {
  setSelectedColor: (color: string) => void
}

// rainbow colors
const paletteColors = [
  'rgba(255, 0, 0, .3)',
  'rgba(255, 127, 0, .3)',
  'rgba(255, 255, 0, .3)',
  'rgba(0, 255, 0, .3)',
  'rgba(0, 0, 255, .3)',
  'rgba(75, 0, 130, .3)',
  'rgba(148, 0, 211, .3)'
]

function Palette({ setSelectedColor }: Props) {
  const [currentColor, setCurrentColor] = useState(paletteColors[0])
  const toolCtx = useContext(ToolContext)

  useEffect(() => {
    setSelectedColor(currentColor)
  }, [currentColor, setSelectedColor])

  return (
    <div className={styles.palette}>
      <div className={styles.icon}>
        <img src={paletteSVG} alt='Palette' title='Palette' />
      </div>
      <ul>
        {paletteColors.map((color) => (
          <li
            key={color}
            style={{
              /* @ts-ignore */
              '--palette-color': color.replace('.3', '1'),
              backgroundColor: color.replace('.3', '1')
            }}
            className={`${currentColor === color ? styles.colorSelected : ''}`}
            onClick={() => {
              setCurrentColor(color)
              toolCtx?.setCurrentTool((prev) => ({
                ...prev,
                color: color
              }))
            }}
          />
        ))}
      </ul>
    </div>
  )
}

export default Palette
