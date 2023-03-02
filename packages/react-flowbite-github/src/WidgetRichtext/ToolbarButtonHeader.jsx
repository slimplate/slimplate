import cx from 'classnames'
import { useEffect, useState } from 'react'
import { useEditor } from './EditorContext'
import ToolbarButton from './ToolbarButton'
import { H1, H2, H3, H4 } from 'tabler-icons-react'

export default function ToolbarButtonHeader ({ children, ...props }) {
  const [open, setOpen] = useState(false)
  const { editor, commandStates } = useEditor()

  useEffect(() => {
    setOpen(false)
  }, [commandStates])

  function handleChange (e, format, param) {
    e.preventDefault()

    // to toggle the header back into a p
    editor.getSelection().focusNode.parentNode.localName === param
      ? editor.execCommand(format, !1, 'p')
      : editor.execCommand(format, !1, param)

    setOpen(false)
  }

  // gets the correct icon
  function getIcon () {
    switch (editor.getSelection()?.focusNode?.parentNode?.localName) {
      case 'h1':
        return <H1 size='16' />
      case 'h2':
        return <H2 size='16' />
      case 'h3':
        return <H3 size='16' />
      case 'h4':
        return <H4 size='16' />
      default:
        return children
    }
  }

  return (
    <div>
      <ToolbarButton
        name='header'
        onClick={() => setOpen(!open)}
        {...props}
      >
        {getIcon()}
      </ToolbarButton>
      <div className={cx('absolute z-10 rounded-lg shadow dark:bg-gray-800 py-2 text-sm text-gray-700 dark:text-gray-200', { hidden: !open })}>
        <button onClick={(e) => handleChange(e, 'formatBlock', 'h1')} className='block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'>H1</button>
        <button onClick={(e) => handleChange(e, 'formatBlock', 'h2')} className='block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'>H2</button>
        <button onClick={(e) => handleChange(e, 'formatBlock', 'h3')} className='block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'>H3</button>
        <button onClick={(e) => handleChange(e, 'formatBlock', 'h4')} className='block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'>H4</button>
        <button onClick={(e) => handleChange(e, 'formatBlock', 'h5')} className='block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'>H5</button>
      </div>
    </div>
  )
}
