import React, { useState, useEffect } from 'react'
import { Modal, Button } from 'flowbite-react'
import ToolbarButton from './ToolbarButton'
import { useEditor } from './EditorContext'
import { html2mdx, outputComponentPlaceHolder } from './utils'

export default function ToolbarButtonComponent ({ type, children, handler, ...props }) {
  const { editor, name, onChange } = useEditor()
  const [disabled, setDisabled] = useState(true)
  const [modalValues, setModalValues] = useState({})
  const [currentItem, setCurrentItem] = useState({})
  const [showModal, setShowModal] = useState(false)

  const handlEditorElementClick = ({ data }) => {
    if (data.name === name && data.type === type) {
      const element = editor.getElementById(data.id)
      if (data.action === 'edit') {
        setModalValues(JSON.parse(unescape(element?.dataset?.props || '%7B%7D')))
        setCurrentItem(data.id)
        setShowModal(true)
      } else if (data.action === 'delete') {
        element.parentElement.removeChild(element)
        html2mdx(editor.body.innerHTML, { name }).then(r => {
          onChange(r)
        })
      } else {
        console.error(`Unknown action: ${data.action}`)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('message', handlEditorElementClick)
    return () => window.removeEventListener('message', handlEditorElementClick)
  }, [])

  useEffect(() => {
    if (!!modalValues?.text?.length && !!modalValues?.url?.length) {
      setDisabled(false)
    } else {
      setDisabled(true)
    }
  }, [modalValues])

  const handleClickToolbarButton = () => {
    editor.execCommand('insertHTML', false, outputComponentPlaceHolder({ name, type }) + '<br />')
  }

  const handleSubmit = () => {
    const element = editor.getElementById(currentItem)
    element.dataset.props = escape(JSON.stringify(modalValues))
    html2mdx(editor.body.innerHTML, { name }).then(r => {
      onChange(r)
    })
    setShowModal(false)
  }

  return (
    <>
      {showModal && (
        <Modal show onClose={() => setShowModal(false)}>
          <Modal.Header className='dark:bg-gray-800'>
            Edit {type}
          </Modal.Header>
          <Modal.Body className='dark:bg-gray-800 dark:text-white'>
            {handler({ onChange: setModalValues, value: modalValues })}
          </Modal.Body>
          <Modal.Footer className='flex justify-end gap-2 dark:bg-gray-800 '>
            <Button color='gray' onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button disabled={disabled} onClick={e => handleSubmit(e)}>
              Ok
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <ToolbarButton onClick={handleClickToolbarButton} {...props}>{children}</ToolbarButton>
    </>
  )
}
