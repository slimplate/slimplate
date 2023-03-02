import cx from 'classnames'
import { useEditor } from './EditorContext'
import { ToolbarButtonMarkdown } from './components'

export default function Toolbar ({ addMarkdownButton, children, ...props }) {
  const { markdownMode, editor } = useEditor()

  if (!editor) {
    return
  }

  return (
    <div className={cx('flex gap-2 p-2 rounded-t-lg mt-4 dark:bg-gray-700 bg-gray-50 border border-gray-300 dark:border-gray-600')} {...props}>
      {!markdownMode && children}
      {addMarkdownButton && (
        <ToolbarButtonMarkdown className='ml-auto' />
      )}
    </div>
  )
}
