import { Button, Divider, Dropdown, Menu } from '@arco-design/web-react'
import styles from './styles/other-actions.module.scss'
interface Props {
  onSave: () => void
}

function OtherActions({ onSave }: Props) {
  const droplist = (
    <Menu>
      <Menu.Item key='PlagiarismCheck'>对比查重</Menu.Item>
      <Menu.Item key='AnnotationLib'>批注库</Menu.Item>
      <Menu.Item key='TargetLib'>目标库</Menu.Item>
      <Menu.Item key='CommentLib'>评语库</Menu.Item>
    </Menu>
  )

  return (
    <div className={styles.otherActions}>
      <Button size='mini'>实验数据</Button>
      <Button size='mini'>智能查重</Button>
      <Button size='mini'>自动批阅</Button>
      <Button size='mini'>智能总评</Button>
      <Button size='mini'>文本模式</Button>
      <Button size='mini'>文字</Button>
      <Button
        type='primary'
        status='danger'
        size='mini'
      >
        删除
      </Button>
      <Divider type='vertical' />
      <Button
        type='primary'
        size='mini'
        onClick={onSave}
      >
        保存上传
      </Button>
      <Dropdown
        droplist={droplist}
        trigger={'click'}
      >
        <Button size='mini'>...</Button>
      </Dropdown>
    </div>
  )
}

export default OtherActions
