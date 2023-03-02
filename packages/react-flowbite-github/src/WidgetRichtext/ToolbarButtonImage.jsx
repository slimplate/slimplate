import { useState } from 'react'
import { useEditor } from './EditorContext'
import ToolbarButton from './ToolbarButton'
import { Button, TextInput, Label, Modal } from 'flowbite-react'

export default function ToolbarButtonImage ({ children, ...props }) {
  const [showModal, setShowModal] = useState(false)
  const [link, setLink] = useState('')
  const { editor } = useEditor()

  function handleShowModal () {
    setLink(editor.getSelection().focusNode.parentNode.href)
    setShowModal(true)
  }

  function handleCancel () {
    setLink('')
    setShowModal(false)
  }

  function handleSubmit (e) {
    e.preventDefault()
    editor.execCommand('insertImage', false, link)
    setShowModal(false)
  }

  return (
    <div>
      {showModal && (
        <Modal show onClose={() => setShowModal(false)}>
          <Modal.Header className='dark:bg-gray-800'>
            New Link
          </Modal.Header>
          <Modal.Body className='dark:bg-gray-800'>
            <div className='mb-2 block'>
              <Label value='Link' />
            </div>
            <TextInput
              type='text'
              defaultValue={link}
              onChange={e => setLink(e.target.value)}
              required
            />
          </Modal.Body>
          <Modal.Footer className='flex justify-end gap-2 dark:bg-gray-800 '>
            <Button color='gray' onClick={handleCancel}>
              Cancel
            </Button>
            <Button disabled={!link} onClick={e => handleSubmit(e)}>
              Ok
            </Button>
          </Modal.Footer>

        </Modal>
      )}
      <ToolbarButton
        name='image'
        onClick={handleShowModal}
        {...props}
      >
        {children}
      </ToolbarButton>
    </div>
  )
}
