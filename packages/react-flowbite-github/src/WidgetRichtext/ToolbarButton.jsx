import cx from 'classnames'
import { Button } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { useEditor } from './EditorContext'

export default function ToolbarButton ({ name, children, className, ...props }) {
  const { buttonStatus, editor } = useEditor()
  const [highlighted, setHighlighted] = useState(false)

  useEffect(() => {
    buttonStatus[name]
      ? setHighlighted(true)
      : setHighlighted(false)
  }, [buttonStatus, name])

  function handleFormat () {
    editor.execCommand(name)
  }

  return (
    <Button
      color='gray'
      size='md'
      type='button'
      onClick={handleFormat}
      className={cx(className, 'dark:border-transparent dark:text-sm dark:focus:text-neutral-100 dark:focus:bg-gray-600 dark:bg-gray-600 dark:text-gray-400 dark:hover:dark:bg-gray-500 dark:focus:ring-yellow-500 h-10 ', {
        'dark:text-neutral-100 dark:bg-gray-500': highlighted
      })}
      {...props}
    >
      <div className='flex items-center h-5'>
        {children}
      </div>
    </Button>
  )
}
